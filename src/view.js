import onChange from 'on-change';

const renderFeeds = (state, elements) => {
  if (state.feeds.length !== 0) {
    elements.feeds.innerHTML = `
            <div class="card border-0">
                <div class="card-body"><h2 class="card-title h4">Фиды</h2></div>
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

const renderValidation = (state, elements) => {
    if (state.rssForm.errors === null) {
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = 'RSS успешно загружен';
    } else {
        elements.input.classList.add('is-invalid');
        elements.feedback.classList.add('text-danger');
        elements.feedback.textContent = state.rssForm.errors;
    }
};

const renderPosts = (state, elements) => {
  if (state.posts.length !== 0) {
    elements.posts.innerHTML = `
    <div class="card border-0">
      <div class="card-body"><h2 class="card-title h4">Посты</h2></div>
      <ul class="list-group border-0 rounded-0">
      </ul>
    </div>
    `;
    const ul = elements.posts.querySelector('ul');
    const postsHTML = [];
    console.log(state.posts);
    state.posts.forEach((posts) => {
      posts.forEach((post) => postsHTML.push(`
      <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        <a href="${post.link}" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${post.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
      </li>
      `))
      });
    ul.innerHTML = postsHTML.join('');
  } else {
    elements.post.innerHTML = '';
  }
};

export default (state, elements) => onChange(state, (path, value) => {
  if (path === 'rssForm.errors') {
    renderValidation(state, elements);
  } if (path === 'feeds') {
  renderFeeds(state, elements);
  } if (path === 'posts') {
    renderPosts(state, elements);
  }
});
