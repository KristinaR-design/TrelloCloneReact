export const ADD_COLUMN = "ADD_COLUMN";
export const DELETE_COLUMN = "DELETE_COLUMN";
export const SET_COLUMNS = "SET_COLUMNS";
export const EDIT_COLUMN = "EDIT_COLUMN";
export const REORDER_COLUMNS = "REORDER_COLUMNS";

export const addColumn = (title, boardId) => async (dispatch) => {
  const response = await fetch("https://6943f6c87dd335f4c35ec3c7.mockapi.io/colums", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, boardId }),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch({
      type: ADD_COLUMN,
      payload: data,
    });
  } else {
    console.error("Failed to add column.");
  }
};


export const deleteColumn = (id) => async (dispatch) => {
  const response = await fetch(`${"https://6943f6c87dd335f4c35ec3c7.mockapi.io/colums"}/${id}`, {
      method: "DELETE",
  });

  if (response.ok) {
      dispatch({
          type: DELETE_COLUMN,
          payload: id,
      });
  } else {
      console.error("Failed to delete column.");
  }
};

export const setColumns = (boardId) => async (dispatch) => {
  try {
    const response = await fetch("https://6943f6c87dd335f4c35ec3c7.mockapi.io/colums");
    if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();
    
    dispatch({
      type: SET_COLUMNS,
      payload: data,
    });
  } catch (error) {
    console.error("Error fetching columns:", error.message);
  }
};


export const editColumn = (id, updatedColumn) => async (dispatch) => {
  const response = await fetch(`${"https://6943f6c87dd335f4c35ec3c7.mockapi.io/colums"}/${id}`, {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedColumn),
  });

  if (response.ok) {
      const data = await response.json();

      dispatch({
          type: EDIT_COLUMN,
          payload: {
              id,
              updatedColumn: data,
          },
      });
  } else {
      console.error("Failed to edit column.");
  }
};

export const reorderColumns = (reorderedColumns) => async (dispatch) => {
  dispatch({
    type: REORDER_COLUMNS,
    payload: reorderedColumns,
  });
  try {
    // Update each column's order in the API
    for (let i = 0; i < reorderedColumns.length; i++) {
      const column = reorderedColumns[i];
      await fetch(`${"https://6943f6c87dd335f4c35ec3c7.mockapi.io/colums"}/${column.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...column,
          order: i
        }),
      });
    }

    // Update local state
    dispatch({
      type: REORDER_COLUMNS,
      payload: reorderedColumns,
    });
  } catch (error) {
    console.error("Failed to reorder columns:", error);
  }
};