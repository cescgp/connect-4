import * as React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import { GridColumnDto as GridBoxDto, GridRowDto } from "../model/GridDto";

export interface PanelProps {
    grid: GridRowDto[];
}

export interface PanelState {
    grid: GridRowDto[];
    currentPlayer: 'red' | 'yellow'
}

export default class Panel extends React.Component<PanelProps, PanelState> {
    constructor(props: any) {
        super(props);

        this.state = {
            grid: this.props.grid,
            currentPlayer: 'red'
        }
    }

    componentDidUpdate(prevProps: Readonly<PanelProps>, prevState: Readonly<PanelState>, snapshot?: any): void {
        if(prevState.grid !== this.state.grid) {
            console.log('GRID', this.state.grid);
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
                    {el.columns.map((c, columnIndex) => {
                        return <Col key={'column_' + rowIndex + '_' + columnIndex} className="d-flex justify-content-center p-0 m-0">{this.renderBox(c, rowIndex, columnIndex)}</Col>
                    })}
                </Row>);
        })
    }

    private renderBox(el: GridBoxDto, rowIndex: number, columnIndex: number) {
        return (
            <div 
                key={'box_' + rowIndex +'_' + columnIndex}
                className={'grid-box m-2 cursor-pointer' + (el.selected === 'red' ? ' selected-player-one' : (el.selected === 'yellow' ? ' selected-player-two' : ''))}
                onClick={() => this.playOnColumn(el, columnIndex)}
            />
        )
    }
    
    private playOnColumn(el: GridBoxDto, columnIndex: number) {
        let box: GridBoxDto = {...this.state.grid[this.state.grid.filter((el) => el.columns[columnIndex].selected === 'none').length - 1].columns[columnIndex], selected: this.state.currentPlayer}
        let newGrid: GridRowDto[] = [...this.state.grid];
        newGrid[this.state.grid.filter((el) => el.columns[columnIndex].selected === 'none').length - 1].columns[columnIndex] = box;
        this.setState({
            grid: newGrid,
            currentPlayer: this.state.currentPlayer === 'red' ? 'yellow' : 'red'
        });
    }
}