/**
 * Section 类方法
 * @author heroic
 */

/**
 * 删除节点组
 * @param  {String}   节点组 id       
 * @param  {Function} callback 回调函数
 *  - err    MongooseError
 * @return {null}
 */
exports.destroy = function(id, callback) {
  this.findById(id, function(err, section) {
    if (err) {
      return callback(err);
    }
    section.remove(callback);
  });
};