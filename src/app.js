import _ from 'lodash';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import * as yup from 'yup';
import render from './view.js';
import parse from './parser.js';
import ru from './locales/ru.js';

const proxify = (url, base = 'https://allorigins.hexlet.app/get') => {
  const newUrl = new URL(base);
  const searchUrl = encodeURI(url);
  newUrl.searchParams.set('disableCache', 'true');
  newUrl.searchParams.set('url', searchUrl);
  return newUrl;
};

const loadFeed = (watchedState, url) => axios.get(proxify(url))
  .then(({ data }) => {
    const [feed, posts] = parse(data.contents);
    const newFeed = { ...feed, id: _.uniqueId(), url };
    watchedState.feeds = [newFeed, ...watchedState.feeds];
    const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedId: newFeed.id }));
    watchedState.posts = [...newPosts, ...watchedState.posts];
    watchedState.rssForm.error = null;
    watchedState.rssForm.state = 'processed';
  })
  .catch((err) => {
    if (err.isParsingError) {
      watchedState.rssForm.error = 'formValidationStatus.errors.notValidRss';
    } else if (err.isAxiosError) {
      watchedState.rssForm.error = 'formValidationStatus.errors.networkProblems';
    } else {
      watchedState.rssForm.error = 'formValidationStatus.errors.unknownError';
    }
    watchedState.rssForm.state = 'failed';
  });

const updatePosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => axios.get(proxify((feed.url)))
    .then(({ data }) => {
      const [, posts] = parse(data.contents);
      const oldPosts = watchedState.posts.filter((post) => post.feedId === feed.id);
      const newPosts = _.differenceBy(posts, oldPosts, 'link');
      if (newPosts.length === 0) {
        return;
      }
      const updatedPosts = newPosts.map((post) => ({ ...post, id: _.uniqueId, feedId: feed.id }));
      watchedState.posts = [...updatedPosts, ...watchedState.posts];
    })
    .catch((e) => console.log(e)));
  Promise.all(promises)
    .finally(() => setTimeout(() => updatePosts(watchedState), 5000));
};

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
      error: null,
    },
    uiState: {
      visitedIds: new Set(),
      modalId: null,
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
  })
    .then(() => {
      yup.setLocale({
        string: {
          url: i18nextInstance.t('formValidationStatus.errors.notValidUrl'),
        },
        mixed: {
          required: i18nextInstance.t('formValidationStatus.errors.required'),
          notOneOf: i18nextInstance.t('formValidationStatus.errors.rssExists'),
        },
      });

      const watchedState = onChange(state, (path) => {
        render(state, elements, path, i18nextInstance);
      });

      const validate = (url, urls) => {
        const schema = yup
          .string()
          .required()
          .url()
          .notOneOf(urls);
        return schema.validate(url);
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.rssForm.state = 'processing';
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const urls = watchedState.feeds.map((feed) => feed.url);
        validate(url, urls)
          .then((validUrl) => loadFeed(watchedState, validUrl))
          .catch((err) => {
            watchedState.rssForm.error = err.message;
            watchedState.rssForm.state = 'failed';
          });
      });

      elements.posts.addEventListener('click', (e) => {
        if (e.target.dataset.id) {
          watchedState.uiState.modalId = e.target.dataset.id;
          watchedState.uiState.visitedIds.add(e.target.dataset.id);
        }
      });

      setTimeout(() => updatePosts(watchedState), 5000);
    });
};
