import axios from "axios";

export const getMsgs = async () => {
	const res = await axios.get(`http://localhost:4000/`);
	console.log(res);
	return res.data;
};
export const getUser = async (userObj) => {
	const res = await axios.get(`http://localhost:4000/user?${userObj}`);
	console.log(res);
	return res;
};
