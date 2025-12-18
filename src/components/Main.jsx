import React, { useEffect, useState } from "react";
import "../css/Main.css";
import { Popover } from "react-tiny-popover";
import deleteImg from "../assets/delete.png";
import editImg from "../assets/change.png";
import Tasks from "../components/tasks";
import { setColumns, addColumn, deleteColumn, editColumn, reorderColumns } from "../store/actions/columnActions";
import { reorderCards } from "../store/actions/cardActions";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Main = ({ activeBoard }) => {
  const dispatch = useDispatch();
  const columns = useSelector((state) => state.column.columns);
  const cards = useSelector((state) => state.card.cards);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ title: "" });
  const [isEditOpen, setIsEditOpen] = useState(null);

  useEffect(() => {
    if (activeBoard?.id) {
      dispatch(setColumns(activeBoard.id));
    }
  }, [activeBoard, dispatch]);

  const handleAddColumn = () => {
    if (!newColumn.title.trim()) return;
    dispatch(addColumn(newColumn.title, activeBoard.id));
    setNewColumn({ title: "" });
    setIsPopoverOpen(false);
  };

  const handleDeleteColumn = (id) => {
    dispatch(deleteColumn(id));
  };

  const handleEditColumn = (id) => {
    if (!newColumn.title.trim()) return;
    dispatch(editColumn(id, { title: newColumn.title }));
    setNewColumn({ title: "" });
    setIsEditOpen(null);
  };

  const onDragEnd = (result) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;

    if (type === "column") {
      if (source.index === destination.index) return;

      const boardColumns = columns
        .filter(col => col.boardId === activeBoard.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const reordered = Array.from(boardColumns);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      const updatedColumns = reordered.map((col, index) => ({ ...col, order: index }));
      dispatch(reorderColumns(updatedColumns));
    }

    if (type === "task") {
      const sourceColumnId = source.droppableId.split("-")[2];
      const destinationColumnId = destination.droppableId.split("-")[2];

      const movedCard = cards.find(c => c.id.toString() === draggableId);
      if (!movedCard) return;

      const sourceCards = cards
        .filter(c => c.column_id === sourceColumnId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const destCards = cards
        .filter(c => c.column_id === destinationColumnId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const sourceIndex = sourceCards.findIndex(c => c.id.toString() === draggableId);
      if (sourceIndex !== -1) sourceCards.splice(sourceIndex, 1);

      const updatedMovedCard = { ...movedCard, column_id: destinationColumnId, desk_id: activeBoard.id };
      destCards.splice(destination.index, 0, updatedMovedCard);

      const updatedSourceCards = sourceCards.map((c, i) => ({ ...c, order: i }));
      const updatedDestCards = destCards.map((c, i) => ({ ...c, order: i }));

      const allUpdatedCards = [...updatedSourceCards, ...updatedDestCards];
      dispatch(reorderCards(allUpdatedCards));
    }
  };

  return (
    <div className="main">
      {activeBoard ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns-droppable" direction="horizontal" type="column">
            {(provided) => (
              <div className="columns" ref={provided.innerRef} {...provided.droppableProps}>
                {columns
                  .filter(col => col.boardId === activeBoard.id)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          className="column"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div className="column-title" {...provided.dragHandleProps}>
                            {column.title}
                          </div>

                          <Tasks currentTask={column} />

                          <div className="task-buttons">
                            <Popover
                              isOpen={isEditOpen === column.id}
                              positions={["bottom", "right", "top", "left"]}
                              content={
                                <div className="newDesk">
                                  <button className="x__button" onClick={() => setIsEditOpen(null)}>x</button>
                                  <input
                                    className="newTitle"
                                    value={newColumn.title}
                                    onChange={(e) => setNewColumn({ title: e.target.value })}
                                  />
                                  <button className="newButton" onClick={() => handleEditColumn(column.id)}>APPLY</button>
                                </div>
                              }
                            >
                              <button onClick={() => setIsEditOpen(column.id)}>
                                <img src={editImg} alt="Edit" width="25" />
                              </button>
                            </Popover>

                            <button onClick={() => handleDeleteColumn(column.id)}>
                              <img src={deleteImg} alt="Delete" width="25" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}

                <div className="add-column-container">
                  <Popover
                    isOpen={isPopoverOpen}
                    positions={["bottom", "right", "top", "left"]}
                    content={
                      <div className="newDesk">
                        <button className="x__button" onClick={() => setIsPopoverOpen(false)}>x</button>
                        <input
                          className="newTitle"
                          value={newColumn.title}
                          onChange={(e) => setNewColumn({ title: e.target.value })}
                        />
                        <button className="newButton" onClick={handleAddColumn}>ADD</button>
                      </div>
                    }
                  >
                    <button className="newButton add-column-button" onClick={() => setIsPopoverOpen(true)}>
                      ADD COLUMN
                    </button>
                  </Popover>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <h2>Select a board</h2>
      )}
    </div>
  );
};

export default Main;
