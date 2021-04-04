// electron IPC API
const IPC = {
    GET_SETTINGS : "GET_SETTINGS",
    SET_SETTINGS : "SET_SETTINGS",
    RUN_LOCAL : "RUN_LOCAL",
    RUN_REMOTE : "RUN_REMOTE",
    CONNECT_HOST : "CONNECT_HOST",
    NOTIFY : "NOTIFY",
    GET_NODES : "GET_NODES",
}
// vuex mutations
const MUT = {
    SET_NODES : "SET_NODES",
    ADD_NODE : "ADD_NODE",
}
// vuex actions
const ACT = {
    // SET_NODES : "SET_NODES",
    // ADD_NODE : "SET_NODES",
}

export { IPC, MUT, ACT };