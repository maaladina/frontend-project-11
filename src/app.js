import _ from 'lodash';
import validate from './validate.js';
import fetch from './fetch.js';
import render from './view.js';
import parse from './parser.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const state = {
    rssForm: {
      state: 'filling',
      errors: '',
      valid: true,
    },
    feeds: [],
    posts: [],
  };

  const watchedState = render(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.rssForm.state = 'filling';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urls = watchedState.feeds.map((feed) => feed.url);
    validate(url, urls)
      .then((validUrl) => {
        watchedState.rssForm.valid = true;
        watchedState.rssForm.state = 'processing';
        return fetch(validUrl);
      })
      .then(({ data }) => {
        const [feed, posts] = parse(data.contents);
        const newFeed = { ...feed, id: _.uniqueId(), url };
        watchedState.feeds = [newFeed, ...watchedState.feeds];
        const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId, feedId: newFeed.id }));
        watchedState.posts = [newPosts, ...watchedState.posts];
        watchedState.rssForm.errors = null;
        watchedState.rssForm.state = 'success';
        elements.form.reset();
        elements.input.focus();
      })
      .catch((err) => {
        watchedState.rssForm.valid = false;
        if (err.name === 'ValidationError') {
          watchedState.rssForm.errors = err.message;
        } else if (err.name === 'TypeError') {
          watchedState.rssForm.errors = 'Ресурс не содержит валидный RSS';
        }
      });
  });
};
