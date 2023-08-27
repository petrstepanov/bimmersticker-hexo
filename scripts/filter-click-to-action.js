var fm = require('hexo-front-matter');

// Based on the "hexo-featured-image" I think
hexo.extend.filter.register('before_post_render', function(data) {
	var front = fm.parse(data.raw);
	var click_to_action_url = front.click_to_action_url;
	if (click_to_action_url) {
        data.click_to_action_url = click_to_action_url;
	}
	var click_to_action_text = front.click_to_action_text;
	if (click_to_action_text) {
        data.click_to_action_text = click_to_action_text;
	}
	return data;
});