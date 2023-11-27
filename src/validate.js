import * as yup from 'yup';

export default (url, urls, i18nextInstance) => {
  yup.setLocale({
    string: {
      url: i18nextInstance.t('formValidationStatus.errors.notValidUrl'),
    },
    mixed: {
      required: i18nextInstance.t('formValidationStatus.errors.required'),
      notOneOf: i18nextInstance.t('formValidationStatus.errors.rssExists'),
    }
  })
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(urls);

  return schema.validate(url);
};
