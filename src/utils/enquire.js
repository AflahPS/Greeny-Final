class Enquiry {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObject = { ...this.queryStr };
    const excludeFields = ['sort', 'limit', 'page'];
    excludeFields.forEach((el) => delete queryObject[el]);
    this.query = this.query.find(queryObject);

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort;

      if (sortBy === 'price-ascending') {
        sortBy = 'price';
      }
      if (sortBy === 'price-descending') {
        sortBy = '-price';
      }
      if (sortBy === 'popular') {
        sortBy = '-ratingsAverage';
      }
      if (sortBy === 'newly-added' || sortBy === 'dafault') {
        sortBy = '-createdAt';
      }
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  paginator() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 12;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = Enquiry;
