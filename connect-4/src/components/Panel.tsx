import { count } from "console";
import * as React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import { threadId } from "worker_threads";
import { brotliCompress } from "zlib";
import { GridBoxDto, GridWinnerCounter } from "../model/GridDto";
import { animated, useSpring } from "@react-spring/web";
import Box from "./Box";

export interface PanelProps {
    grid: GridBoxDto[][];
}

export interface PanelState {
    grid: GridBoxDto[][];
    currentPlayer: 'red' | 'yellow'
    winners: GridBoxDto[];
    hoverColumn: number;
}

const COUNTER_DEFAULT_VALUE: GridWinnerCounter =  {up: [], down: [], left: [], right: [], ddl: [], ddr: [], dul: [], dur: []}

export default class Panel extends React.Component<PanelProps, PanelState> {
    constructor(props: any) {
        super(props);

        this.state = {
            grid: this.props.grid,
            currentPlayer: 'red',
            winners: [],
            hoverColumn: -1
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
                        return <Col 
                                    onMouseEnter={() => this.setState({hoverColumn: columnIndex})}
                                    onMouseLeave={() => this.setState({hoverColumn: -1})}
                                    key={'column_' + rowIndex + '_' + columnIndex} 
                                    className={'d-flex justify-content-center p-0 m-0' + (this.state.hoverColumn === columnIndex ? ' bg-light cursor-pointer' : '')}>
                                        {this.renderBox(c, rowIndex, columnIndex)}
                                </Col>
                    })}
                </Row>);        
        })
    }

    private renderBox(el: GridBoxDto, rowIndex: number, columnIndex: number) {
        return (
            <div 
                key={'box_' + rowIndex +'_' + columnIndex}
                className={'grid-box m-2 cursor-pointer' +
                    (el.selected === 'red' ? ' selected-player-one' : 
                        (el.selected === 'yellow' ? ' selected-player-two' : '')) + 
                        (this.isWinner(el) ? ' winner' : '')}
                onClick={() => this.playOnColumn(el, columnIndex, this.state.currentPlayer)}
            />
        )
    }
    
    private isWinner(el: GridBoxDto): boolean {
        return this.state.winners.findIndex((w) => w.column === el.column && w.row === el.row) !== -1;
    }
    
    private playOnColumn(el: GridBoxDto, columnIndex: number, currentPlayer: string) {
        if(this.state.winners.length === 0) {
            let box: GridBoxDto = {...this.state.grid[this.state.grid.filter((el) => el[columnIndex].selected === 'none').length - 1][columnIndex], selected: this.state.currentPlayer}
            let newGrid: GridBoxDto[][] = [...this.state.grid];
            newGrid[this.state.grid.filter((el) => el[columnIndex].selected === 'none').length - 1][columnIndex] = box;
            let winners = this.hasWinCheckRecusively(box, box.selected, newGrid, {up: [], down: [], left: [], right: [], ddl: [], ddr: [], dul: [], dur: []});
            if(winners && winners.length > 0) {
                winners.push(box);
            }
            this.setState({
                grid: newGrid,
                currentPlayer: currentPlayer === 'red' ? 'yellow' : 'red',
                winners: winners
            });
        }
    }

    private hasWinCheckRecusively(box: GridBoxDto, currentPlayer: string, array: GridBoxDto[][], counter: GridWinnerCounter): GridBoxDto[] {
        this.checkSelectedBoxesForWinner(box, currentPlayer, array, counter);
        return Object.values(counter).filter((c) => c.length == 3).length > 0 ? Object.values(counter).filter((c) => c.length == 3)[0] : [];
    }

    private checkSelectedBoxesForWinner(box: GridBoxDto, currentPlayer: string, array: GridBoxDto[][], counter: GridWinnerCounter, direction?: keyof GridWinnerCounter): void {
        let endSearch: boolean = false;
        if(box !== undefined && box !== null && box.selected === currentPlayer) {
            if(direction) { // miramos hacia la misma dirección
                if(counter[direction].findIndex((b) => b.row === box.row && b.column === box.column && b.selected === box.selected) === -1) {
                    counter[direction].push(box);
                    if(this.checkNextDirection(box, direction, array)) {
                        this.checkSelectedBoxesForWinner(this.getNextBoxByDirection(box, direction, array), currentPlayer, array, counter, direction);
                    }
                }
            } else { // tenemos que revisar todas las direcciones posibles
                let directions: any = Object.keys(counter);
                let i = 0;
                while(!endSearch && i < directions.length) {
                    let dir: keyof GridWinnerCounter = directions[i];
                    if(!!dir) {
                        if(this.checkNextDirection(box, dir, array)) {
                            this.checkSelectedBoxesForWinner(this.getNextBoxByDirection(box, dir, array), currentPlayer, array, counter, dir)
                            endSearch = counter[dir].length >= 4;
                        } 
                        
                    }

                    i++;
                }
            }
        }
    }

    private checkNextDirection(box: GridBoxDto, dir: string, array: GridBoxDto[][]): boolean {
        switch(dir) {
            case 'up':
                return !!array[box.row + 1] && !!array[box.row + 1][box.column];
            case 'down':
                return !!array[box.row - 1] && !!array[box.row - 1][box.column];
            case 'left':
                return !!array[box.row] && !!array[box.row][box.column - 1];
            case 'right':
                return !!array[box.row] && !!array[box.row][box.column + 1];
            case 'ddl':
                return !!array[box.row - 1] && !!array[box.row - 1][box.column - 1];
            case 'ddr':
                return !!array[box.row - 1] && !!array[box.row - 1][box.column + 1];
            case 'dul':
                return !!array[box.row + 1] && !!array[box.row + 1][box.column - 1];
            case 'dur':
                return !!array[box.row + 1] && !!array[box.row + 1][box.column + 1];
            default: 
                return false;
        }
    }
    
    private getNextBoxByDirection(box: GridBoxDto, direction: keyof GridWinnerCounter, array: GridBoxDto[][]): GridBoxDto {
        switch(direction) {
            case 'up':
                return array[box.row + 1][box.column];
            case 'down':
                return array[box.row - 1][box.column];
            case 'left':
                return array[box.row][box.column - 1];
            case 'right':
                return array[box.row][box.column + 1];
            case 'ddl':
                return array[box.row - 1][box.column - 1];
            case 'ddr':
                return array[box.row - 1][box.column + 1];
            case 'dul':
                return array[box.row + 1][box.column - 1];
            case 'dur':
                return array[box.row + 1][box.column + 1];
        }
    }
}