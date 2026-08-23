const filterQuery = (queryParams, allowedFields) => {
  const filter = {};

  allowedFields.forEach((field) => {
    if (queryParams[field] !== undefined && queryParams[field] !== "") {
      filter[field] = queryParams[field];
    }
  });

  // Search functionality
  if (queryParams.search && queryParams.searchFields) {
    const searchFields = queryParams.searchFields.split(",");
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: queryParams.search, $options: "i" },
    }));
  }

  // Date range
  if (queryParams.startDate || queryParams.endDate) {
    filter.createdAt = {};
    if (queryParams.startDate) {
      filter.createdAt.$gte = new Date(queryParams.startDate);
    }
    if (queryParams.endDate) {
      filter.createdAt.$lte = new Date(queryParams.endDate);
    }
  }

  return filter;
};

export default filterQuery;
