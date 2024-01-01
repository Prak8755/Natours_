//here we are creating a class objects and refactoring all our ,filtering, pagination,sorting etc inside its methods

class APIfeatures{
    constructor(query,queryObj){
      this.query=query;
      this.queryObj=queryObj;
    }
    filter(){
      const newQueryObj = { ...this.queryObj};
      const arr = ['sort', 'page', 'limit', 'fields'];
      arr.forEach((el) => delete newQueryObj[el]);
     //Advance filtering
      let queryStr = JSON.stringify(newQueryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      this.query=this.query.find(JSON.parse(queryStr));
      return this
    }
    sort(){
      if (this.queryObj.sort) {
              let sortBy=this.queryObj.sort.split(',').join(' ');
              this.query=this.query.sort(sortBy)
            }
            else{
              this.query=this.query.sort('createdAt')
            }
            return this;
    }
    fields(){
      if(this.queryObj.fields){
             let newField=this.queryObj.fields.split(',').join(' ');
            //  console.log(newField);
              this.query=this.query.select(newField);
            }
            else{
              this.query=this.query.select('-__v');
            }
            return this;
    }
    pagination(){
      if(this.queryObj.page||this.queryObj.limit){
              let limit=this.queryObj.limit*1||10;
              let page=this.queryObj.page*1||1;
              let item=(page-1)*limit;
              this.query=this.query.skip(item).limit(limit);  
            }
            return this
    }
  }

module.exports=APIfeatures;
