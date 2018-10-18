import { State, Action, StateContext, NgxsOnInit } from "@ngxs/store";
import produce from "immer";
import { flow, range } from 'lodash';
import * as _ from "lodash";

import { MoveNextToColumn, MoveLastToGoal, ResetBoard } from "./board.actions";

export interface BoardStateModel {
    sourceStacks: number[][];
    columns: number[][];
    goalStacks: number[][];
    nextSourceValue: number;
}

@State<BoardStateModel>({
    name: 'board',
    defaults: {
        sourceStacks: [],
        columns: [],
        goalStacks: [],
        nextSourceValue: null
    }
})
export class BoardState implements NgxsOnInit {
    public ngxsOnInit(ctx: StateContext<BoardStateModel>): void {
        ctx.dispatch(new ResetBoard());
    }

    @Action(ResetBoard)
    public resetBoard(ctx: StateContext<BoardStateModel>): void {
        ctx.setState(
            flow(
                this.populateSourceStacks,
                this.populateColumns,
                this.populateGoalStacks,
                this.pickNextSource
            )({
                sourceStacks: [],
                columns: [],
                goalStacks: [],
                nextSourceValue: null
            })
        );
    }

    @Action(MoveNextToColumn)
    public moveNextToColumn(ctx: StateContext<BoardStateModel>, action: MoveNextToColumn): void {
        let board = ctx.getState();

        ctx.setState(flow(
            produce(draft => {
                const card = _.find(draft.sourceStacks, o => _.some(o, p => p === board.nextSourceValue)).pop();
                draft.columns[action.colIndex].push(card);
            }),
            this.pickNextSource
        )(board));
    }

    @Action(MoveLastToGoal)
    public moveLastToGoal(ctx: StateContext<BoardStateModel>, action: MoveLastToGoal): void {
        let board = ctx.getState();

        const card = _.last(board.columns[action.colIndex]);

        const goalIndex = board.goalStacks.findIndex(o => card > 1 ? _.last(o) === card - 1 : _.isEmpty(o));

        if (goalIndex >= 0) {
            ctx.setState(produce(
                board,
                draft => {
                    draft.columns[action.colIndex].pop();
                    draft.goalStacks[goalIndex].push(card);
                }));
        }
    }

    private pickNextSource(board: BoardStateModel): BoardStateModel {
        const numbers = board.sourceStacks
            .filter(o => o.length > 0)
            .map(o => _.last(o));

        const nextSourceValue =
            numbers.length > 0
                ? numbers[Math.floor(Math.random() * numbers.length)]
                : null;

        return produce(
            board,
            draft => {
                draft.nextSourceValue = nextSourceValue;
            });
    }

    private populateSourceStacks(board: BoardStateModel): BoardStateModel {
        return produce(
            board,
            draft => {
                draft.sourceStacks = [];
                range(0, 16).forEach(i => draft.sourceStacks.push(Array(6).fill(i + 1)));
            });
    }

    private populateColumns(board: BoardStateModel): BoardStateModel {
        return produce(
            board,
            draft => {
                draft.columns = [];
                range(0, 6).forEach(i => draft.columns.push([]));
            });
    }

    private populateGoalStacks(board: BoardStateModel): BoardStateModel {
        return produce(
            board,
            draft => {
                draft.goalStacks = [];
                range(0, 6).forEach(i => draft.goalStacks.push([]));
            });
    }
}