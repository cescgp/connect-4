import { count } from "console";
import * as React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import { threadId } from "worker_threads";
import { brotliCompress } from "zlib";
import { GridBoxDto, GridWinnerCounter } from "../model/GridDto";

export interface PanelProps {
    grid: GridBoxDto[][];
}

export interface PanelState {
    grid: GridBoxDto[][];
    currentPlayer: 'red' | 'yellow'
    winners: GridBoxDto[];
}

const COUNTER_DEFAULT_VALUE: GridWinnerCounter =  {up: [], down: [], left: [], right: [], ddl: [], ddr: [], dul: [], dur: []}

export default class Panel extends React.Component<PanelProps, PanelState> {
    constructor(props: any) {
        super(props);

        this.state = {
            grid: this.props.grid,
            currentPlayer: 'red',
            winners: []
        }
    }

    componentDidUpdate(prevProps: Readonly<PanelProps>, prevState: Readonly<PanelState>, snapshot?: any): void {
        if(prevState.grid !== this.state.grid) {
            this.checkWinner(prevState.currentPlayer);
        }
    }

    render(): React.ReactNode {
        return (
            <div>
                <Container>
                    <Card className="mt-5">
                        <CardHeader>
                            Connect 4
                        </CardHeader>
                        <Card.Body>
                            {this.renderRows()}
                        </Card.Body>
                        
                    </Card>
                </Container>
            </div>
        )
    }

    private renderRows(): React.ReactNode {
        return this.state.grid.map((el, rowIndex) => {
            return (
                <Row key={'row_' + rowIndex} className="d-flex justify-content-center">
                    {el.map((c, columnIndex) => {
                        return <Col key={'column_' + rowIndex + '_' + columnIndex} className="d-flex justify-content-center p-0 m-0">{this.renderBox(c, rowIndex, columnIndex)}</Col>
                    })}
                </Row>);        
        })
    }

    private renderBox(el: GridBoxDto, rowIndex: number, columnIndex: number) {
        return (
            <div 
                key={'box_' + rowIndex +'_' + columnIndex}
                className={'grid-box m-2 cursor-pointer' + 
                    (this.isWinner(el) ? ' winner' :
                    (el.selected === 'red' ? ' selected-player-one' : 
                        (el.selected === 'yellow' ? ' selected-player-two' : '')))}
                onClick={() => this.playOnColumn(el, columnIndex, this.state.currentPlayer)}
            />
        )
    }
    
    private isWinner(el: GridBoxDto): boolean {
        return this.state.winners.findIndex((w) => w.column === el.column && w.row === el.row) !== -1;
    }
    
    private playOnColumn(el: GridBoxDto, columnIndex: number, currentPlayer: string) {
        let box: GridBoxDto = {...this.state.grid[this.state.grid.filter((el) => el[columnIndex].selected === 'none').length - 1][columnIndex], selected: this.state.currentPlayer}
        let newGrid: GridBoxDto[][] = [...this.state.grid];
        newGrid[this.state.grid.filter((el) => el[columnIndex].selected === 'none').length - 1][columnIndex] = box;
        this.hasWinCheckRecusively(box, box.selected, newGrid, {up: [], down: [], left: [], right: [], ddl: [], ddr: [], dul: [], dur: []});
        this.setState({
            grid: newGrid,
            currentPlayer: currentPlayer === 'red' ? 'yellow' : 'red'
        });
    }

    private checkWinner(currentPlayer: string) : void {
        // console.log('------------------------------------------------------');
        // this.test1(currentPlayer)
        // console.log('------------------------------------------------------');
    }

    private test1(currentPlayer: string) {
        let winners:GridBoxDto[] = [];
        for(let r = 0; r < this.state.grid.length; r++) {
            for(let c = 0; c < this.state.grid[r].length; c++) {
                if(!!this.state.grid[r][c] && this.state.grid[r][c].selected === currentPlayer){
                    console.log('INIT SEARCH --- !', this.state.grid[r][c])
                    let counter = {up: [], down: [], left: [], right: [], ddl: [], ddr: [], dul: [], dur: []};
                    let selected = this.checkSelectedBoxesForWinner(this.state.grid[r][c], currentPlayer, this.state.grid, this.state.grid[r][c], counter);
                    console.log('SELECTED --- ', selected)
                    console.log('COUNTER --- ', counter)
                    if(this.hasWin(counter)) {
                        console.log('WINER', currentPlayer)
                        // alert('WINER! ' + currentPlayer)
                    }
                }
            }
        }

        // console.log('WINNERS', winners);
    }

    private hasWinCheckRecusively(box: GridBoxDto, currentPlayer: string, array: GridBoxDto[][], counter: GridWinnerCounter): boolean {
        this.checkSelectedBoxesForWinner(box, currentPlayer, array, box, counter);
        console.log('hasWinCheckRecusively - counter', counter);
        return false;
    }

    private checkSelectedBoxesForWinner(box: GridBoxDto, currentPlayer: string, array: GridBoxDto[][], from: GridBoxDto, counter: GridWinnerCounter, direction?: keyof GridWinnerCounter): GridBoxDto[] {
        let selected: GridBoxDto[] = [];
        if(box.selected === currentPlayer) {
            console.log('selected by currentPlayer', currentPlayer)
            if(direction) {
                if(counter[direction].findIndex((b) => b.row === box.row && b.column === box.column && b.selected === box.selected) === -1) {
                    counter[direction].push(box);
                }
            }
            selected.push(box);
            if (this.hasWin(counter)){
                return selected;
            } else {
                // revisar arriba
                if(selected.length < 4 && !!array[box.row - 1] && !!array[box.row - 1][box.column] && !this.equalsFrom(array[box.row - 1][box.column], from)) {
                    selected.push(...this.checkSelectedBoxesForWinner(array[box.row - 1][box.column], currentPlayer, array, box, counter, 'up'))
                }
                // revisar abajo
                if(selected.length < 4 && !!array[box.row + 1] && !!array[box.row + 1][box.column] && !this.equalsFrom(array[box.row + 1][box.column], from)) {
                    selected.push(...this.checkSelectedBoxesForWinner(array[box.row + 1][box.column], currentPlayer, array, box, counter, 'down'))
                }
                //revisar izquierda
                if(selected.length < 4 && !!array[box.row] && !!array[box.row][box.column - 1] && !this.equalsFrom(array[box.row][box.column - 1], from)) {
                    selected.push(...this.checkSelectedBoxesForWinner(array[box.row][box.column - 1], currentPlayer, array, box, counter, 'left'))
                }
                //revisar derecha
                if(selected.length < 4 && !!array[box.row] && !!array[box.row][box.column + 1] && !this.equalsFrom(array[box.row][box.column + 1], from)) {
                    selected.push(...this.checkSelectedBoxesForWinner(array[box.row][box.column + 1], currentPlayer, array, box, counter, 'right'))
                }

                // revisar diagonales derecha arriba
                if(selected.length < 4 && !!array[box.row + 1] && !!array[box.row + 1][box.column + 1] && !this.equalsFrom(array[box.row + 1][box.column + 1], from)) {
                    selected.push(...this.checkSelectedBoxesForWinner(array[box.row + 1][box.column + 1], currentPlayer, array, box, counter, 'dur'))
                }
                // revisar diagonales derecha abajo
                if(selected.length < 4 && !!array[box.row + 1] && !!array[box.row + 1][box.column - 1] && !this.equalsFrom(array[box.row + 1][box.column - 1], from)) {
                    selected.push(...this.checkSelectedBoxesForWinner(array[box.row + 1][box.column - 1], currentPlayer, array, box, counter, 'ddr' ))
                }
                // revisar diagonales izquierda arriba
                if(selected.length < 4 && !!array[box.row - 1] && !!array[box.row - 1][box.column + 1] && !this.equalsFrom(array[box.row - 1][box.column + 1], from)) {
                    selected.push(...this.checkSelectedBoxesForWinner(array[box.row - 1][box.column + 1], currentPlayer, array, box, counter, 'dul' ))
                }
                // revisar diagonales izquierda abajo
                if(selected.length < 4 && !!array[box.row - 1] && !!array[box.row - 1][box.column - 1] && !this.equalsFrom(array[box.row - 1][box.column - 1], from)) {
                    selected.push(...this.checkSelectedBoxesForWinner(array[box.row - 1][box.column - 1], currentPlayer, array, box, counter, 'ddl'))
                }
            }
        }

        return selected;
    }
    private hasWin(counter: GridWinnerCounter): boolean {
        console.log('hasWin -> counter', counter);
        return Object.values(counter).findIndex(v => v.length >= 4) !== -1;
    }

    private equalsFrom(next: GridBoxDto, from: GridBoxDto): boolean {
        return !!from && !!next && from.row === next.row && from.column === next.column;
    }
}