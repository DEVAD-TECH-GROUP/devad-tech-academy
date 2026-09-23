import { getInitials, getAvatarColor } from "../../utils/generateAvatar";

export default function Avatar({ user, size = "md", className = "" }) {
  const sizes = {
    xs:  "w-6 h-6 text-[10px]",
    sm:  "w-8 h-8 text-xs",
    md:  "w-10 h-10 text-sm",
    lg:  "w-14 h-14 text-base",
    xl:  "w-20 h-20 text-xl",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold shrink-0 overflow-hidden ${className}`}
      style={{ background: user?.avatar?.url ? undefined : getAvatarColor(user?.firstName) }}
    >
      {user?.avatar?.url
        ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
        : getInitials(user?.firstName, user?.lastName)
      }
    </div>
  );
}