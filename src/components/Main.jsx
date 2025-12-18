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
  const columns = useSelector(state => state.column.columns);
  const cards = useSelector(state => state.card.cards);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ title: "" });
  const [isEditOpen, setIsEditOpen] = useState(null);

  useEffect(() => {
    if (activeBoard?.id) dispatch(setColumns(activeBoard.id));
  }, [activeBoard, dispatch]);

  const handleAddColumn = () => {
    if (!newColumn.title.trim()) return;
    dispatch(addColumn(newColumn.title, activeBoard.id));
    setNewColumn({ title: "" });
    setIsPopoverOpen(false);
  };

  const handleDeleteColumn = (id) => dispatch(deleteColumn(id));

  const handleEditColumn = (id) => {
    if (!newColumn.title.trim()) return;
    dispatch(editColumn(id, { title: newColumn.title }));
    setNewColumn({ title: "" });
    setIsEditOpen(null);
  };

  const onDragEnd = (result) => {
    const { source, destination, type, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "column") {
      const boardColumns = columns
        .filter((col) => col.boardId === activeBoard.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const reordered = Array.from(boardColumns);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      dispatch(reorderColumns(reordered.map((col, i) => ({ ...col, order: i }))));
      return;
    }

    if (type === "task") {
      const sourceColId = source.droppableId.replace("tasks-", "");
      const destColId = destination.droppableId.replace("tasks-", "");

      const movedCard = cards.find(c => c.id.toString() === draggableId);
      if (!movedCard) return;

      const updatedCards = cards.map(c => ({ ...c }));

      // удалить из старой колонки
      const sourceCards = updatedCards
        .filter(c => String(c.column_id) === sourceColId && c.id !== movedCard.id);

      // вставить в новую
      const destCards = updatedCards.filter(c => String(c.column_id) === destColId);

      movedCard.column_id = Number(destColId);
      destCards.splice(destination.index, 0, movedCard);

      sourceCards.forEach((c, i) => (c.order = i));
      destCards.forEach((c, i) => (c.order = i));

      dispatch(reorderCards([...sourceCards, ...destCards]));
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
                      {(provided, snapshot) => (
                        <div
                          className={`column ${snapshot.isDragging ? 'dragging' : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <div className="column-title" {...provided.dragHandleProps}>{column.title}</div>
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
