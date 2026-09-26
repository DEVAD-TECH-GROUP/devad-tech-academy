import { useEffect, useState } from "react";
import {
  getIntegrations,
  getAPIKeys,
  createAPIKey,
  deleteAPIKey,
} from "../../services/superadmin/integrationService";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { SkeletonCard } from "../../components/common/Skeleton";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-hot-toast";

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);

  const [newKey, setNewKey] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async (isRefresh = false) => {
    console.log("[INTEGRATIONS] ========================================");
    console.log(
      `[INTEGRATIONS] ${isRefresh ? "Refreshing" : "Loading"} integration data...`
    );

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log("[INTEGRATIONS] Calling getIntegrations()...");
      console.log("[INTEGRATIONS] Calling getAPIKeys()...");

      const [integrationsResponse, apiKeysResponse] = await Promise.all([
        getIntegrations(),
        getAPIKeys(),
      ]);

      console.log(
        "[INTEGRATIONS] getIntegrations response:",
        integrationsResponse
      );

      console.log(
        "[INTEGRATIONS] getAPIKeys response:",
        apiKeysResponse
      );

      const integrationsData =
        integrationsResponse?.data?.data ||
        integrationsResponse?.data ||
        [];

      const apiKeysData =
        apiKeysResponse?.data?.data ||
        apiKeysResponse?.data ||
        [];

      console.log(
        "[INTEGRATIONS] Parsed integrations:",
        integrationsData
      );

      console.log("[INTEGRATIONS] Parsed API keys:", apiKeysData);

      setIntegrations(
        Array.isArray(integrationsData) ? integrationsData : []
      );

      setApiKeys(Array.isArray(apiKeysData) ? apiKeysData : []);

      console.log("[INTEGRATIONS] Data loaded successfully.");
      console.log(
        `[INTEGRATIONS] Integration count: ${
          Array.isArray(integrationsData) ? integrationsData.length : 0
        }`
      );

      console.log(
        `[INTEGRATIONS] API key count: ${
          Array.isArray(apiKeysData) ? apiKeysData.length : 0
        }`
      );
    } catch (error) {
      console.error(
        "[INTEGRATIONS] Failed to load integration data:",
        error
      );

      console.error(
        "[INTEGRATIONS] Error response:",
        error?.response
      );

      console.error(
        "[INTEGRATIONS] Error data:",
        error?.response?.data
      );

      console.error(
        "[INTEGRATIONS] Error message:",
        error?.message
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load integrations"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);

      console.log("[INTEGRATIONS] Loading completed.");
      console.log("[INTEGRATIONS] ========================================");
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    console.log("[INTEGRATIONS] Component mounted.");

    loadData();

    return () => {
      console.log("[INTEGRATIONS] Component unmounted.");
    };
  }, []);

  // ============================================================
  // CREATE API KEY
  // ============================================================

  const handleCreateKey = async () => {
    console.log("[INTEGRATIONS] Create API key requested.");
    console.log("[INTEGRATIONS] Key name:", keyName);

    const trimmedName = keyName.trim();

    if (!trimmedName) {
      console.warn(
        "[INTEGRATIONS] API key creation rejected: name is empty."
      );

      toast.error("Key name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      console.warn(
        "[INTEGRATIONS] API key creation rejected: name too short."
      );

      toast.error("Key name must be at least 2 characters.");
      return;
    }

    setCreating(true);

    try {
      console.log(
        "[INTEGRATIONS] Sending createAPIKey request..."
      );

      const response = await createAPIKey({
        name: trimmedName,
      });

      console.log(
        "[INTEGRATIONS] createAPIKey response:",
        response
      );

      const createdKey =
        response?.data?.data ||
        response?.data?.key ||
        response?.data;

      console.log(
        "[INTEGRATIONS] Created API key:",
        createdKey
      );

      if (!createdKey) {
        console.error(
          "[INTEGRATIONS] API key creation returned no key data."
        );

        throw new Error("API key was created but no key data was returned.");
      }

      setNewKey(createdKey);

      setApiKeys((currentKeys) => [
        createdKey,
        ...currentKeys,
      ]);

      setKeyName("");
      setShowCreate(false);

      console.log(
        "[INTEGRATIONS] API key created successfully."
      );

      toast.success(
        "API key created! Copy it now — it may not be shown again."
      );
    } catch (error) {
      console.error(
        "[INTEGRATIONS] Failed to create API key:",
        error
      );

      console.error(
        "[INTEGRATIONS] Create API key response:",
        error?.response
      );

      console.error(
        "[INTEGRATIONS] Create API key response data:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create API key."
      );
    } finally {
      setCreating(false);

      console.log(
        "[INTEGRATIONS] Create API key operation completed."
      );
    }
  };

  // ============================================================
  // DELETE / REVOKE API KEY
  // ============================================================

  const handleDeleteKey = async (id) => {
    console.log(
      "[INTEGRATIONS] Revoke API key requested:",
      id
    );

    if (!id) {
      console.error(
        "[INTEGRATIONS] Cannot revoke API key: missing ID."
      );

      toast.error("Invalid API key.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to revoke this API key? This action cannot be undone."
    );

    if (!confirmed) {
      console.log(
        "[INTEGRATIONS] API key revoke cancelled by user."
      );

      return;
    }

    setDeletingKey(id);

    try {
      console.log(
        "[INTEGRATIONS] Calling deleteAPIKey:",
        id
      );

      const response = await deleteAPIKey(id);

      console.log(
        "[INTEGRATIONS] deleteAPIKey response:",
        response
      );

      setApiKeys((currentKeys) =>
        currentKeys.filter((key) => key._id !== id)
      );

      // If the currently displayed newly-created key was revoked,
      // remove the alert as well.
      if (newKey?._id === id) {
        setNewKey(null);
      }

      console.log(
        "[INTEGRATIONS] API key revoked successfully:",
        id
      );

      toast.success("API key revoked successfully.");
    } catch (error) {
      console.error(
        "[INTEGRATIONS] Failed to revoke API key:",
        error
      );

      console.error(
        "[INTEGRATIONS] Revoke response:",
        error?.response
      );

      console.error(
        "[INTEGRATIONS] Revoke response data:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to revoke API key."
      );
    } finally {
      setDeletingKey(null);

      console.log(
        "[INTEGRATIONS] Revoke API key operation completed."
      );
    }
  };

  // ============================================================
  // COPY API KEY
  // ============================================================

  const handleCopyKey = async (key) => {
    console.log("[INTEGRATIONS] Copy API key requested.");

    if (!key) {
      console.warn(
        "[INTEGRATIONS] Cannot copy empty API key."
      );

      toast.error("API key is unavailable.");
      return;
    }

    try {
      await navigator.clipboard.writeText(key);

      console.log(
        "[INTEGRATIONS] API key copied successfully."
      );

      toast.success("API key copied!");
    } catch (error) {
      console.error(
        "[INTEGRATIONS] Failed to copy API key:",
        error
      );

      toast.error(
        "Unable to copy automatically. Please copy it manually."
      );
    }
  };

  // ============================================================
  // CLEAR NEW KEY ALERT
  // ============================================================

  const handleDismissNewKey = () => {
    console.log(
      "[INTEGRATIONS] New API key alert dismissed."
    );

    setNewKey(null);
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-5 fi">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="dsp text-xl font-bold text-text">
            Integrations
          </h1>

          <p className="text-xs text-muted mt-1">
            Manage connected services and API keys.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="text-xs bg-surfaceHigh border border-border text-text px-3 py-2 rounded-xl hover:border-purple/40 transition disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* ======================================================
          NEW API KEY ALERT
      ====================================================== */}

      {newKey && (
        <div className="bg-green/10 border border-green/20 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-semibold text-green">
                ✅ API Key Created
              </p>

              <p className="text-[10px] text-muted mt-1">
                Copy this key now. For security, the complete key
                may not be displayed again.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismissNewKey}
              className="text-muted hover:text-text text-sm"
              title="Dismiss"
            >
              ×
            </button>
          </div>

          <div className="flex gap-2">
            <code className="flex-1 min-w-0 bg-surfaceHigh rounded-xl px-3 py-2 text-xs text-green font-mono truncate">
              {newKey.key || newKey.token || "Key unavailable"}
            </code>

            <button
              type="button"
              onClick={() =>
                handleCopyKey(
                  newKey.key || newKey.token
                )
              }
              className="text-xs text-green border border-green/20 px-3 py-1.5 rounded-xl hover:bg-green/10 transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          ACTIVE INTEGRATIONS
      ====================================================== */}

      {integrations.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="dsp text-sm font-bold text-text">
                Active Integrations
              </h2>

              <p className="text-[10px] text-muted mt-1">
                Services currently configured for the academy.
              </p>
            </div>

            <span className="text-[10px] text-muted">
              {integrations.length}{" "}
              {integrations.length === 1
                ? "integration"
                : "integrations"}
            </span>
          </div>

          <div className="space-y-2">
            {integrations.map((integration) => (
              <div
                key={
                  integration._id ||
                  integration.id ||
                  integration.slug
                }
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text capitalize truncate">
                    {integration.name ||
                      integration.slug ||
                      "Unknown Integration"}
                  </p>

                  <p className="text-[10px] text-muted mt-0.5">
                    {integration.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      integration.isActive
                        ? "bg-green"
                        : "bg-border"
                    }`}
                  />

                  <span
                    className={`text-[10px] ${
                      integration.isActive
                        ? "text-green"
                        : "text-muted"
                    }`}
                  >
                    {integration.isActive
                      ? "Connected"
                      : "Disabled"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================
          NO INTEGRATIONS
      ====================================================== */}

      {integrations.length === 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">🔌</div>

          <h2 className="text-sm font-semibold text-text">
            No integrations found
          </h2>

          <p className="text-xs text-muted mt-1">
            No active integrations are currently configured.
          </p>
        </div>
      )}

      {/* ======================================================
          API KEYS
      ====================================================== */}

      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div>
            <h2 className="dsp text-sm font-bold text-text">
              API Keys
            </h2>

            <p className="text-[10px] text-muted mt-1">
              Create and revoke keys used by trusted applications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              console.log(
                "[INTEGRATIONS] Opening create API key modal."
              );

              setShowCreate(true);
            }}
            className="shrink-0 text-xs bg-purple/10 text-purple border border-purple/20 px-3 py-1.5 rounded-xl hover:bg-purple/20 transition"
          >
            + Create Key
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">🔑</div>

            <p className="text-xs font-medium text-text">
              No API keys yet
            </p>

            <p className="text-[10px] text-muted mt-1">
              Create an API key to allow trusted applications
              to access your services.
            </p>
          </div>
        ) : (
          <div>
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey._id}
                className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text truncate">
                    {apiKey.name || "Unnamed API Key"}
                  </p>

                  <p className="text-[10px] text-muted font-mono mt-1">
                    {apiKey.prefix
                      ? `${apiKey.prefix}••••••••`
                      : "••••••••••••"}
                  </p>

                  {apiKey.createdAt && (
                    <p className="text-[10px] text-muted mt-0.5">
                      Created{" "}
                      {formatDate(apiKey.createdAt)}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteKey(apiKey._id)
                  }
                  disabled={deletingKey === apiKey._id}
                  className="shrink-0 text-xs text-red hover:underline disabled:opacity-50"
                >
                  {deletingKey === apiKey._id
                    ? "Revoking..."
                    : "Revoke"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================
          CREATE API KEY MODAL
      ====================================================== */}

      <Modal
        isOpen={showCreate}
        onClose={() => {
          if (!creating) {
            console.log(
              "[INTEGRATIONS] Closing create API key modal."
            );

            setShowCreate(false);
          }
        }}
        title="Create API Key"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Key Name *"
            value={keyName}
            onChange={(event) =>
              setKeyName(event.target.value)
            }
            placeholder="e.g. Mobile App Key"
            required
            disabled={creating}
          />

          <p className="text-[10px] text-muted">
            Use a descriptive name so you can identify where
            this API key is being used.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (!creating) {
                  setShowCreate(false);
                }
              }}
              disabled={creating}
              className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-purple/40 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreateKey}
              disabled={creating || !keyName.trim()}
              className="flex-1 bg-purple hover:bg-purple/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Key"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
