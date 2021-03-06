/**
 * 路由配置
 * @author heroic
 */

/**
 * Module dependencies
 */
var api = require('../api'),
  auth = require('./middlewares/auth'),
  upload = require('./controllers/upload'),
  user = require('./controllers/user'),
  settings = require('./controllers/settings'),
  topics = require('./controllers/topics'),
  tag = require('./controllers/tag'),
  topic = require('./controllers/topic'),
  comment = require('./controllers/comment'),
  favorite = require('./controllers/favorite'),
  notification = require('./controllers/notification');

module.exports = exports = function(app) {
  // 文件上传
  app.all('/upload/:type', auth.isLogin);
  app.post('/upload/image', upload.uploadImage);

  // 用户
  app.all('/signup', auth.unLogin, user.signup);
  app.all('/signin', auth.unLogin, user.signin);
  app.get('/active', user.activate);
  app.post('/logout', auth.isLogin, user.logout);
  app.all('/forgot', user.forgotPassword);
  app.all('/reset', user.resetPassword);

  app.all('/user/:username/:op?', user.load);
  app.get('/user/:username', user.get);
  app.post('/user/:username/:op', auth.isLogin);
  // 关注的相关操作直接调用 api
  app.post('/user/:username/follow',
      api.requestHandler(api.relation.create));
  app.post('/user/:username/unfollow',
      api.requestHandler(api.relation.remove));

  // 用户设置
  app.all('/settings/:op?', auth.isLogin);
  app.get('/settings', settings.get);
  app.post('/settings/profile', settings.profile);
  app.post('/settings/change_pass', settings.changePassword);

  // 提醒
  app.all('/notifications/:op?', auth.isLogin);
  app.get('/notifications', notification.list);
  app.post('/notifications/read', notification.read);

  // 话题列表
  app.get('/', topics.list);
  app.get('/topics/:type?', topics.list);
  app.get('/tag/:name', tag.load, tag.topics);
  app.get('/tag/:name/topics/:type?', tag.load, tag.topics);

  // 单个话题
  app.all('/topic/create', auth.isLogin, topic.create);
  app.get('/topic/:id', topic.load, topic.get);
  app.all('/topic/:id/:op', auth.isLogin, topic.load);
  app.all('/topic/:id/edit', auth.isTopicAuthor, topic.edit);
  app.post('/topic/:id/remove', auth.isTopicAuthor, topic.remove);

  // 收藏相关操作直接调用 api
  app.post('/topic/:id/favorite',
      api.requestHandler(api.favoriteTopic.create));
  app.post('/topic/:id/unfavorite',
      api.requestHandler(api.favoriteTopic.remove));
  app.post('/tag/:name/:op', auth.isLogin, tag.load);
  app.post('/tag/:name/favorite',
      api.requestHandler(api.favoriteTag.create));
  app.post('/tag/:name/unfavorite',
      api.requestHandler(api.favoriteTag.remove));
  // 收藏列表
  app.get('/favorite/:type', auth.isLogin);
  app.get('/favorite/topics', favorite.topics);
  app.get('/favorite/tags', favorite.tags);

  // 评论
  app.post('/comment/create', auth.isLogin, comment.create);
  // 删除评论直接调用 api
  app.post('/comment/:id/remove', auth.isLogin, comment.load,
      auth.isCommentAuthor, api.requestHandler(api.comment.remove));
};