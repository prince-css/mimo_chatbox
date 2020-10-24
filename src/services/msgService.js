import axios from "axios";

export const getMsgs = async () => {
	const res = await axios.get(`http://localhost:4000/`);
	// console.log(res);
	return res.data;
};
export const getUser = async (userObj) => {
	const res = await axios.get(`http://localhost:4000/user?${userObj}`);
	// console.log(res);
	return res;
};
export const postUser = async (newUserObj) => {
	return await axios.post(`http://localhost:4000/user`, newUserObj);
};
export const postActivationCode = async (id) => {
	console.log(id);
	return await axios.post(`http://localhost:4000/code`, id);
};
