import React, { useEffect, useState } from "react";
import "../css/Main.css";
import "../css/Drag.css";
import { Popover } from "react-tiny-popover";
import deleteImg from "../assets/delete.png";
import editImg from "../assets/change.png";
import {
    addCard,
    deleteCard,
    setCards,
    editCard,
} from "../store/actions/cardActions";
import { useDispatch, useSelector } from "react-redux";
import { Droppable, Draggable } from "@hello-pangea/dnd";

const Tasks = ({ currentTask }) => {
    const dispatch = useDispatch();
    const cards = useSelector((state) => state.card.cards);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "" });
    const [isEditOpen, setIsEditOpen] = useState(null);

    useEffect(() => {
        dispatch(setCards());
    }, [dispatch]);

    const filteredCards = cards
        .filter((c) => String(c.column_id) === String(currentTask.id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const addNewTask = () => {
        if (!newTask.title.trim()) return;

        dispatch(
            addCard({
                title: newTask.title,
                column_id: currentTask.id,
                desk_id: currentTask.board_id,
                completed: false,
                order: filteredCards.length,
            })
        );

        setNewTask({ title: "" });
        setIsPopoverOpen(false);
    };

    const toggleComplete = (item) => {
        dispatch(editCard(item.id, { completed: !item.completed }));
    };

    const applyEdit = (id) => {
        dispatch(editCard(id, { title: newTask.title }));
        setIsEditOpen(null);
        setNewTask({ title: "" });
    };

    return (
        <Droppable droppableId={`tasks-${currentTask.id}`} type="task">
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="task-list"
                    style={{
                        minHeight: 50,
                        padding: 8,
                        background: snapshot.isDraggingOver ? "#f4f5f7" : "transparent",
                        transition: "0.2s",
                    }}
                >
                    {filteredCards.map((item, index) => (
                        <Draggable
                            key={item.id}
                            draggableId={item.id.toString()}
                            index={index}
                        >
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="newDesk"
                                    style={{
                                        ...provided.draggableProps.style,
                                        opacity: snapshot.isDragging ? 0.85 : 1,
                                        boxShadow: snapshot.isDragging
                                            ? "0 8px 16px rgba(0,0,0,0.2)"
                                            : "none",
                                        marginBottom: 8,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={() => toggleComplete(item)}
                                    />

                                    <div className="newDiv">{item.title}</div>

                                    <Popover
                                        isOpen={isEditOpen === item.id}
                                        positions={["right", "top"]}
                                        content={
                                            <div className="newDesk">
                                                <button
                                                    className="x__button"
                                                    onClick={() => setIsEditOpen(null)}
                                                >
                                                    x
                                                </button>
                                                <input
                                                    className="newTitle"
                                                    value={newTask.title}
                                                    onChange={(e) =>
                                                        setNewTask({ title: e.target.value })
                                                    }
                                                />
                                                <button
                                                    className="newButton"
                                                    onClick={() => applyEdit(item.id)}
                                                >
                                                    APPLY
                                                </button>
                                            </div>
                                        }
                                    >
                                        <button
                                            className="delete-button"
                                            onClick={() => {
                                                setIsEditOpen(item.id);
                                                setNewTask({ title: item.title });
                                            }}
                                        >
                                            <img src={editImg} width="20" />
                                        </button>
                                    </Popover>

                                    <button
                                        className="delete-button"
                                        onClick={() => dispatch(deleteCard(item.id))}
                                    >
                                        <img src={deleteImg} width="20" />
                                    </button>
                                </div>
                            )}
                        </Draggable>
                    ))}

                    {provided.placeholder}

                    <Popover
                        isOpen={isPopoverOpen}
                        positions={["right", "top"]}
                        content={
                            <div className="newDesk">
                                <button
                                    className="x__button"
                                    onClick={() => setIsPopoverOpen(false)}
                                >
                                    x
                                </button>
                                <input
                                    className="newTitle"
                                    value={newTask.title}
                                    onChange={(e) =>
                                        setNewTask({ title: e.target.value })
                                    }
                                />
                                <button className="newButton" onClick={addNewTask}>
                                    ADD
                                </button>
                            </div>
                        }
                    >
                        <button
                            className="newButton"
                            onClick={() => setIsPopoverOpen(true)}
                        >
                            ADD
                        </button>
                    </Popover>
                </div>
            )}
        </Droppable>
    );
};

export default Tasks;
