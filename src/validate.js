import * as yup from 'yup';

export default (url, urls) => {
  const schema = yup
    .string('Ресурс не содержит валидный RSS')
    .required()
    .url('Ресурс не содержит валидный RSS')
    .notOneOf(urls, 'RSS уже существует');

  return schema.validate(url);
};
