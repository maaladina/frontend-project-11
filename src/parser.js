export default (data) => {
  const parsedData = new DOMParser().parseFromString(data, 'application/xml');
  const feed = {
    title: parsedData.querySelector('channel title').textContent,
    description: parsedData.querySelector('channel description').textContent,
  };
  const posts = Array.from(parsedData.querySelectorAll('item'))
    .map((item) => (
      {
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
      }
    ));
  return [feed, posts];
};
