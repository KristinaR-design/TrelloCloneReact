export const ADD_BOARD = "ADD_BOARD";
export const DELETE_BOARD = "DELETE_BOARD";
export const SET_BOARDS = "SET_BOARDS";
export const EDIT_BOARD = "EDIT_BOARD";

export const addBoard = (newBoard) => async (dispatch) => {
    const userId = localStorage.getItem("user_id");
    const boardWithColumns = {
        ...newBoard,
        columns: [],
        user_id: userId,
    };

    const response = await fetch("https://67ebb2deaa794fb3222b4541.mockapi.io/login/v1/boards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(boardWithColumns), 
    });

    if (response.ok) {
        const data = await response.json();
        dispatch({
            type: ADD_BOARD,
            payload: data,  
        });
    } else {
        console.error("Failed to add board.");
    }
};

export const deleteBoard = (id) => async (dispatch) => {
    const response = await fetch(`https://67ebb2deaa794fb3222b4541.mockapi.io/login/v1/boards/${id}`, {
        method: "DELETE",
    });

    if (response.ok) {
        dispatch({
            type: DELETE_BOARD,
            payload: id,
        });
    } else {
        console.error("Failed to delete board.");
    }
};


export const setBoards = () => async (dispatch) => {
    const response = await fetch("https://67ebb2deaa794fb3222b4541.mockapi.io/login/v1/boards");
    const data = await response.json();

    const userId = localStorage.getItem("user_id");

    const filteredBoards = data.filter(board => board.user_id === userId);

    dispatch({
        type: SET_BOARDS,
        payload: filteredBoards,
    });
};


export const editBoards = (id, updatedBoard) => async (dispatch) => {
    const response = await fetch(`https://67ebb2deaa794fb3222b4541.mockapi.io/login/v1/boards/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBoard),
    });

    if (response.ok) {
        const data = await response.json();                                                                                                                                                                                                                                                                                                 

        dispatch({
            type: EDIT_BOARD,
            payload: {
                id,
                updatedBoard: data, 
            },
        });
    } else {
        console.error("Failed to edit board.");
    }
};

export const reorderBoards = (boards) => ({
    type: "REORDER_BOARDS",
    payload: boards
});