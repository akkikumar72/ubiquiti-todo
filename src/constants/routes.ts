const auth = {
  signin: "/signin",
  signup: "/signup"
};
const home = "/";
const user = {
  profile: "/user",
  id: (userId: string) => `/user/${userId}`,
};
export const routes = { auth, home, user};
