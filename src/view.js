const renderFeeds = (state, elements, i18nextInstance) => {
  elements.feeds.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');
  elements.feeds.prepend(div);
  const title = document.createElement('div');
  title.classList.add('card-body');
  div.append(title);
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t('feeds');
  title.prepend(h2);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    li.append(h3);
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(p);
    ul.append(li);
  });
  div.append(ul);
};

const renderPosts = (state, elements, i18nextInstance) => {
  elements.posts.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');
  elements.posts.prepend(div);
  const title = document.createElement('div');
  title.classList.add('card-body');
  div.append(title);
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t('posts.title');
  title.prepend(h2);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  state.posts.forEach((post) => {
    const postClass = state.uiState.visitedIds.has(post.id) ? 'fw-normal link-secondary' : 'fw-bold';
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.setAttribute('class', postClass);
    a.setAttribute('href', post.link);
    a.dataset.id = post.id;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    li.append(a);
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18nextInstance.t('posts.button');
    li.append(button);
    ul.append(li);
  });
  div.append(ul);
};

const renderVisitedIds = (state) => {
  const visitedIds = [...state.uiState.visitedIds];
  const currentId = visitedIds[visitedIds.length - 1];
  const currentLink = document.querySelector(`a[data-id="${currentId}"]`);
  currentLink.classList.remove('fw-bold');
  currentLink.classList.add('fw-normal', 'link-secondary');
};

const renderModal = (state, elements) => {
  const currentPost = state.posts.find((post) => post.id === state.uiState.modalId);
  elements.modal.title.textContent = currentPost.title;
  elements.modal.body.textContent = currentPost.description;
  elements.modal.link.setAttribute('href', currentPost.link);
};

const renderState = (state, elements, i18nextInstance) => {
  switch (state.rssForm.state) {
    case 'filling':
      elements.button.disabled = false;
      break;
    case 'processing':
      elements.button.disabled = true;
      break;
    case 'processed':
      elements.button.disabled = false;
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = i18nextInstance.t('formValidationStatus.success');
      elements.form.reset();
      elements.input.focus();
      break;
    case 'failed':
      elements.button.disabled = false;
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18nextInstance.t(state.rssForm.error);
      break;
    default:
      break;
  }
};

export default (state, elements, path, i18nextInstance) => {
  switch (path) {
    case 'feeds':
      renderFeeds(state, elements, i18nextInstance);
      break;
    case 'posts':
      renderPosts(state, elements, i18nextInstance);
      break;
    case 'uiState.visitedIds':
      renderVisitedIds(state);
      break;
    case 'uiState.modalId':
      renderModal(state, elements);
      break;
    case 'rssForm.state':
      renderState(state, elements, i18nextInstance);
      break;
    default:
      break;
  }
};
