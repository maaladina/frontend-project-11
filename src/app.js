import _ from 'lodash';
import i18next from 'i18next';
import validate from './validate.js';
import fetch from './fetch.js';
import render from './view.js';
import parse from './parser.js';
import ru from './locales/ru.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      link: document.querySelector('.full-article'),
    },
  };

  const state = {
    rssForm: {
      state: 'filling',
      errors: '',
      valid: true,
    },
    uiState: {
      visitedIds: new Set(),
    },
    feeds: [],
    posts: [],
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });

  const watchedState = render(state, elements, i18nextInstance);

  const updatePosts = () => {
    const promises = state.feeds.map((feed) => fetch(feed.url)
      .then(({ data }) => {
        const [, recPosts] = parse(data.contents);
        const oldPosts = state.posts.filter((post) => post.feedId === feed.id);
        const newPosts = _.differenceBy(recPosts, oldPosts, 'link');
        if (newPosts.length !== 0) {
          const updatedPosts = recPosts.map((post) => ({ ...post, id: _.uniqueId, feedId: feed.id }));
          watchedState.posts = [...updatedPosts, ...watchedState.posts];
        }
      })
      .catch((e) => console.log(e)));
    Promise.all(promises)
      .finally(() => setTimeout(() => updatePosts(watchedState), 5000));
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.rssForm.state = 'filling';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urls = watchedState.feeds.map((feed) => feed.url);
    validate(url, urls, i18nextInstance)
      .then((validUrl) => {
        watchedState.rssForm.valid = true;
        watchedState.rssForm.state = 'processing';
        return fetch(validUrl);
      })
      .then(({ data }) => {
        const [feed, posts] = parse(data.contents);
        const newFeed = { ...feed, id: _.uniqueId(), url };
        watchedState.feeds = [newFeed, ...watchedState.feeds];
        const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedId: newFeed.id }));
        watchedState.posts = [...newPosts, ...watchedState.posts];
        watchedState.rssForm.errors = null;
        watchedState.rssForm.state = 'processed';
        elements.form.reset();
        elements.input.focus();
      })
      .catch((err) => {
        watchedState.rssForm.state = 'failed';
        if (err.name === 'ValidationError') {
          watchedState.rssForm.valid = false;
          watchedState.rssForm.errors = err.message;
        } else if (err.name === 'TypeError') {
          watchedState.rssForm.valid = false;
          watchedState.rssForm.errors = i18nextInstance.t('formValidationStatus.errors.notValidRss');
        } else if (err.name === 'AxiosError') {
          watchedState.rssForm.errors = i18nextInstance.t('formValidationStatus.errors.networkProblems');
        }
      });
  });

  elements.posts.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.closest('button')) {
      watchedState.uiState.visitedIds.add(e.target.dataset.id);
    } else if (e.target.closest('a')) {
      window.open(e.target.href);
      watchedState.uiState.visitedIds.add(e.target.dataset.id);
    }
  });

  setTimeout(() => updatePosts(), 5000);
};
