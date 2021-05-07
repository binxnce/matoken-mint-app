import { joinMemeData } from '../utils/memes';

export const isLoggedInSelector = ({ users: { current, sdkUser } }) => !!current && !!sdkUser;

export const fullMemeDataSelector = (id) => ({ memes: { byId } }) => byId[id] && joinMemeData(byId[id]);
