// electron IPC API
const IPC = {
    GET_SETTINGS : "GET_SETTINGS",
    SET_SETTINGS : "SET_SETTINGS",
    RUN_LOCAL : "RUN_LOCAL",
    RUN_REMOTE : "RUN_REMOTE",
    UPLOAD : "UPLOAD",
    DOWNLOAD : "DOWNLOAD",
    CONNECT_HOST : "CONNECT_HOST",
    DISCONNECT_HOST : "DISCONNECT_HOST",
    NOTIFY : "NOTIFY",
    GET_NODES : "GET_NODES",
    GET_POOLS : "GET_POOLS",
    GET_CONNECTION : "GET_CONNECTION",
    SET_CONNECTION : "SET_CONNECTION",
    SETUP_SSH : "SETUP_SSH",
    CREATE_ADDRESS : "CREATE_ADDRESS",
    CREATE_TRANSACTION : "CREATE_TRANSACTION",
}

export { IPC };