module.exports = class {
  constructor(query, reqObj) {
    this.query = query;
    this.queryObj = reqObj;
  }

  filter() {
    const query = { ...this.queryObj };
    const dontQuery = ['sort', 'limit', 'page', 'fields'];
    Object.keys(query).forEach((key) => {
      if (dontQuery.includes(key)) {
        delete query[key];
      }
    });
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      this.query = this.query.sort(this.queryObj.sort.split(',').join(' '));
    }
    return this;
  }

  limit() {
    if (this.queryObj.limit || this.queryObj.page) {
      const limit = this.queryObj.limit * 1 || 10;
      const page = this.queryObj.page * 1 || 1;
      this.query = this.query.skip(limit * (page - 1)).limit(limit);
    }

    return this;
  }

  fields() {
    if (this.queryObj.fields) {
      this.query = this.query.select(this.queryObj.fields.split(',').join(' '));
    }
    return this;
  }
};
