import onChange from 'on-change';

const renderFeeds = (state, elements, i18nextInstance) => {
  if (state.feeds.length !== 0) {
    elements.feeds.innerHTML = `
            <div class="card border-0">
                <div class="card-body"><h2 class="card-title h4">${i18nextInstance.t('feeds')}</h2></div>
                <ul class="list-group border-0 rounded-0">
                </ul>
            </div>
        `;
    const ul = elements.feeds.querySelector('ul');
    const feedHTML = [];
    state.feeds.forEach((feed) => feedHTML.push(`<li class="list-group-item border-0 border-end-0">
      <h3 class="h6 m-0">${feed.title}</h3>
      <p class="m-0 small text-black-50">${feed.description}</p></li>
    `));
    const ulHTML = feedHTML.join('');
    ul.innerHTML = ulHTML;
  } else {
    elements.feeds.innerHTML = '';
  }
};

const renderValidation = (state, elements, i18nextInstance) => {
  if (state.rssForm.errors === null) {
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.textContent = i18nextInstance.t('formValidationStatus.success');
  } else {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = state.rssForm.errors;
  }
};

const renderPosts = (state, elements, i18nextInstance) => {
  if (state.posts.length !== 0) {
    elements.posts.innerHTML = `
    <div class="card border-0">
      <div class="card-body"><h2 class="card-title h4">${i18nextInstance.t('posts.title')}</h2></div>
      <ul class="list-group border-0 rounded-0">
      </ul>
    </div>
    `;
    const ul = elements.posts.querySelector('ul');
    const postsHTML = [];
    state.posts.forEach((post) => {
      const postClass = state.uiState.visitedIds.has(post.id) ? 'fw-normal link-secondary' : 'fw-bold';
      postsHTML.push(`
      <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        <a href="${post.link}" class="${postClass}" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${post.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18nextInstance.t('posts.button')}</button>
      </li>
      `);
    });
    ul.innerHTML = postsHTML.join('');
  } else {
    elements.posts.innerHTML = '';
  }
};

const renderVisitedIds = (state, elements) => {
  const visitedIds = [...state.uiState.visitedIds];
  const currentId = visitedIds[visitedIds.length - 1];
  const currentLink = document.querySelector(`a[data-id="${currentId}"]`);
  currentLink.classList.remove('fw-bold');
  currentLink.classList.add('fw-normal', 'link-secondary');

  const currentPost = state.posts.find((post) => post.id === currentId);
  elements.modal.title.textContent = currentPost.title;
  elements.modal.body.textContent = currentPost.description;
  elements.modal.link.setAttribute('href', currentPost.link);
};

export default (state, elements, i18nextInstance) => onChange(state, (path) => {
  switch (path) {
    case 'rssForm.errors':
      renderValidation(state, elements, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(state, elements, i18nextInstance);
      break;
    case 'posts':
      renderPosts(state, elements, i18nextInstance);
      break;
    case 'uiState.visitedIds':
      renderVisitedIds(state, elements);
      break;
    default:
      break;
  }
});
