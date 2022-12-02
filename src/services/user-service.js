const baseUrl = "http://localhost:2905/api/users";

export const userService = {
    async get(userData) {
        const url = `${baseUrl}/${userData.email}/${userData.password}`;

        try {
            return await fetch(url).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 404) {
                    throw new Error('wrong login data');
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    },
};
