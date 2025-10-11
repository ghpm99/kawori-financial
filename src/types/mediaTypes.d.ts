export interface media {
    id: number;
    order: number;
    name: string;
    filePath: string;
    fileType: string;
    playing: number;
}

export interface simpleMedia {
    id: number;
    name: string;
}
