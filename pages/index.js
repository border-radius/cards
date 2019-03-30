import { useState, createContext, useReducer, useMemo } from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import { getDiffieHellman } from 'crypto';

const Container = styled.div`
    height: 100%;
    position: relative;
`

const CARD_WIDTH = 180
const CARD_HEIGHT = 250

const CardElem = styled.div`
    width: ${ CARD_WIDTH }px;
    height: ${ CARD_HEIGHT }px;
    background: blue;
    border-radius: 14px;
    background: radial-gradient(#fafafa, #eee);
    box-shadow: 0 8px 20px -12px #eee;
    position: absolute;
    text-align: center;
    font: 72px/${ CARD_HEIGHT }px Verdana, sans-serif;
    color: #ddd;
    user-select: none;
`
const Card = ({ id, x, y, active }) => {
    return <CardElem style={{
        top: y,
        left: x,
        border: active ? '1px solid gold' : 'none',
        zIndex: active ? 10 : 9,
    }}>
        { id.slice(0, 1).toUpperCase() }
    </CardElem>
}

const Pre = styled.pre`
    width: 600px;
    height: 800px;
    overflow-y: auto;
    user-select: none;
`

const CardContext = createContext()

export default function Index() {
    const [ state, setState ] = useReducer(
        (state, newState) => {
            return { ...state, ...newState }
        },
        {
            cards: [],
            drag: null,
            diff: {
                x: 0,
                y: 0,
            }
        }
    )

    const contextState = useMemo(
        () => ({
            ...state,
            setState,
            createCard: () => {
                setState({
                    cards: [
                        ...state.cards,
                        {
                            key: Math.random().toString(36).slice(2),
                            x: Math.ceil(Math.random() * 500),
                            y: Math.ceil(Math.random() * 500),
                            active: false,
                        }
                    ]
                })
            }
        }),
        [ state.cards, state.drag, state.mouse, state.diff ],
    )

    const onMouseDown = ({ clientX, clientY }) => {
        let index;
        let card;

        for (index in state.cards.slice().reverse()) {
            if (
                clientX >= state.cards[index].x &&
                clientX <= state.cards[index].x + CARD_WIDTH &&
                clientY >= state.cards[index].y &&
                clientY <= state.cards[index].y + CARD_HEIGHT
            ) {
                card = state.cards[index]
                break
            }
        }

        if (card) {
            setState({
                drag: parseInt(index),
                diff: {
                    x: clientX - card.x,
                    y: clientY - card.y,
                },
                cards: state.cards.map((item, i) => i !== parseInt(index) ? item : {
                    ...item,
                    active: true,
                })
            })
        }
    }

    const onMouseUp = () => {
        setState({
            drag: null,
            diff: { x: 0, y: 0},
            cards: state.cards.map((item, i) => i !== state.drag ? item : {
                ...item,
                active: false,
            })
        })
    }

    const onMouseMove = ({ clientX, clientY }) => {
        if (state.drag !== null) {
            setState({
                cards: state.cards.map((item, i) => i !== state.drag ? item : {
                    ...item,
                    x: clientX - state.diff.x,
                    y: clientY - state.diff.y,
                })
            })
        }
    }

    return (
        <CardContext.Provider value={ contextState }>
            <Container onMouseMove={ onMouseMove } onMouseDown={ onMouseDown } onMouseUp={ onMouseUp }>
                <Head>
                    <style>
                        { 'html, body, #__next { margin: 0; height: 100%; }' }
                    </style>
                </Head>
                <Pre>{ JSON.stringify(state, null, 2) }</Pre>
                <button onClick={ contextState.createCard }>Create card</button>
                {
                    state.cards.map(({ key, x, y, active }) => <Card key={ key } x={ x } y={ y } active={ active } id={ key }/>)
                }
            </Container>
        </CardContext.Provider>
    )
}