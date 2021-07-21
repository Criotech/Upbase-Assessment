export type User = {
    email: string;
    lastName: string;
    username: string;
    password?: string;
    firstName: string;
    phoneNumber?: string;
    emailVerified: boolean;
    profilePicture: string;
    picturePublicId?: string;
};

export type FetchQuery = {
    page?: string;
    limit?: string;
};


export type MulterFile = {
    path: string;
    size: number;
    encoding: string;
    mimetype: string;
    filename: string;
    fieldname: string;
    destination: string;
    originalname: string;
};

