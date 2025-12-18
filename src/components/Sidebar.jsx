import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../css/Sidebar.css";
import { ChevronRight, ChevronLeft, Plus } from "react-feather";
import { Popover } from 'react-tiny-popover'
import deleteImg from "../assets/delete.png";
import editImg from "../assets/change.png";
import { useDispatch, useSelector } from "react-redux";
import { addBoard, deleteBoard, setBoards, editBoards, reorderBoards } from "../store/actions/boardActions";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Span = styled.span`
    width: 1.6rem;
    height: 1.5rem;
    margin-right: 0.8rem;
    background-color: ${(props) => (props.color)};
    border-radius: 10px;
`;

const Sidebar = ({ setActiveBoard }) => {
    const dispatch = useDispatch();
    const boards = useSelector((state) => state.board.boards) || [];

    const [collapsed, setCollapsed] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(null);
    const [newBoard, setNewBoard] = useState({ title: "", color: "" });

    useEffect(() => {
        dispatch(setBoards());
    }, [dispatch]);

    const addNewBoard = () => {
        dispatch(addBoard(newBoard));
        setIsPopoverOpen(false);
        setNewBoard({ title: "", color: "" });
    };

    const DeleteHandler = (id) => {
        dispatch(deleteBoard(id));
    };

    const editBoard = (id) => {
        dispatch(editBoards(id, newBoard));
        setIsEditOpen(null);
        setNewBoard({ title: "", color: "" });
    };

    const handleChange = (e) => {
        setNewBoard({ ...newBoard, [e.target.name]: e.target.value });
    };

    const setEditOpen = (item) => {
        setIsEditOpen(isEditOpen === item.id ? null : item.id);
        setNewBoard({ title: item.title, color: item.color });
    };


    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination || source.index === destination.index) return;

        const reorderedBoards = Array.from(boards);
        const [movedBoard] = reorderedBoards.splice(source.index, 1);
        reorderedBoards.splice(destination.index, 0, movedBoard);

        const updatedBoards = reorderedBoards.map((board, index) => ({
            ...board,
            order: index
        }));


        dispatch(reorderBoards(updatedBoards));

    };

    return (
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            {collapsed && (
                <div className="p-2">
                    <button onClick={() => setCollapsed(!collapsed)} className="button">
                        <ChevronRight size={17} />
                    </button>
                </div>
            )}

            {!collapsed && (
                <div>
                    <div className="workspace">
                        <h4>Remote Devs Workspace</h4>
                        <button onClick={() => setCollapsed(!collapsed)} className="button-left">
                            <ChevronLeft size={17} />
                        </button>
                    </div>

                    <div className="boardlist">
                        <div className="flex">
                            <h3>Your Boards</h3>

                            <Popover className="popover"
                                isOpen={isPopoverOpen}
                                positions={['right', 'top', 'bottom', 'left']}
                                content={
                                    <div className="newDesk">
                                        <button className="x__button" onClick={() => setIsPopoverOpen(false)}> x </button>
                                        <div className="newDiv">Color:</div>
                                        <input className="newColor" type="color" name="color" value={newBoard.color} onChange={handleChange} />
                                        <div className="newDiv">Title:</div>
                                        <input className="newTitle" name="title" value={newBoard.title} onChange={handleChange} type="text" />
                                        <button className="newButton" onClick={addNewBoard}>ADD</button>
                                    </div>
                                }
                            >
                                <button className="button-left" onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
                                    <Plus size={16} />
                                </button>
                            </Popover>
                        </div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="boards-droppable" type="board">
                            {(provided) => (
                                <ul
                                    className="your-class"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {boards
                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                        .map((item, index) => (
                                            <Draggable
                                                key={item.id}
                                                draggableId={item.id.toString()}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <button className="custom-container" onClick={() => setActiveBoard(item)}>
                                                            <Span color={item.color} />
                                                            <span>{item.title}</span>
                                                        </button>

                                                        <Popover
                                                            className="popover"
                                                            isOpen={isEditOpen === item.id}
                                                            positions={["right", "top", "bottom", "left"]}
                                                            content={
                                                                <div className="newDesk">
                                                                    <button className="x__button" onClick={() => setIsEditOpen(null)}> x </button>
                                                                    <div className="newDiv">Color:</div>
                                                                    <input className="newColor" type="color" name="color" value={newBoard.color} onChange={handleChange} />
                                                                    <div className="newDiv">Title:</div>
                                                                    <input className="newTitle" name="title" value={newBoard.title} onChange={handleChange} type="text" />
                                                                    <button className="newButton" onClick={() => editBoard(item.id)}>APPLY</button>
                                                                </div>
                                                            }
                                                        >
                                                            <button className="delete-button" onClick={() => setEditOpen(item)}>
                                                                <img src={editImg} alt="Edit" width="25" />
                                                            </button>
                                                        </Popover>

                                                        <button className="delete-button" onClick={() => DeleteHandler(item.id)}>
                                                            <img src={deleteImg} alt="Delete" width="25" />
                                                        </button>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
