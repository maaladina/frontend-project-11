import axios from 'axios';
import proxify from './proxy.js';

const fetch = (url) => axios.get(proxify(url));

export default fetch;
