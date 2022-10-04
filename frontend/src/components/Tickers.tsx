import React, {createContext, useContext, useEffect, useState} from "react";
import { IonLabel, IonTextarea, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonContent, IonIcon, IonInput, IonItem, IonList, IonPopover, IonText} from "@ionic/react";
import {closeCircleOutline, pencilOutline} from "ionicons/icons";
import {CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";

export interface TickerInterface {
    tag: number;
    ticker: string;
}

export type TickerContext = {
    tickers: TickerInterface[];
    fetchTickers: () => void;
};

const TickersContext = createContext<TickerContext | null>(null);

const Tickers: React.FC = () => {
    const [tickers, setTickers] = useState<TickerInterface[]>([]);
    const fetchTickers = async () => {
        const response = await fetch("http://localhost:8000/ticker");
        const tickers_response = await response.json();

        setTickers(tickers_response.data);
        return "ok";
    }

    useEffect(() => {
        fetchTickers().then(r => console.log("fetching todos, response:", r));
    }, []);

    return (
        <TickersContext.Provider value={{tickers, fetchTickers}}>
            <IonItem><AddTicker/></IonItem>
            <IonList>
                {tickers.map((ticker) => (
                    <IonChip color="tertiary" key={ticker.tag}>
                        <IonText>{ticker.ticker}</IonText>
                        <UpdateTicker item={ticker.ticker} tag={ticker.tag}/>
                        <DeleteTicker tag={ticker.tag}/>
                    </IonChip>
                ))}
            </IonList>
            <PlotTicker/>
            <ShowStats/>
        </TickersContext.Provider>
    )
}

const AddTicker: React.FC = () => {
    const [ticker, setTicker] = useState<string>("");
    const {tickers, fetchTickers} = useContext(TickersContext) as TickerContext;

    const handleSubmit = (event: any) => {
        const newTicker = {
            "tag": tickers.length + 1,
            "ticker": ticker
        };

        fetch("http://localhost:8000/ticker", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newTicker)
        }).then(fetchTickers);
    }

    return (
        <form onSubmit={handleSubmit}>
            <IonInput
                value={ticker}
                placeholder="Add Ticker"
                required={true}
                onIonChange={e => setTicker(e.detail.value!)}/>
        </form>
    )
}

const UpdateTicker: React.FC<{ tag: number, item: string }> = ({tag, item}) => {
    const [ticker, setTicker] = useState<string>(item);
    const {fetchTickers} = useContext(TickersContext) as TickerContext;

    const updateTicker = async () => {
        await fetch(`http://localhost:8000/ticker/${tag}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ticker: ticker})
        });
        await fetchTickers();
    }

    return (
        <>
            <IonButton fill={'clear'} id={`click-trigger-${tag}`}>
                <IonIcon icon={pencilOutline} slot={"icon-only"}/>
            </IonButton>
            <IonPopover trigger={`click-trigger-${tag}`} triggerAction="click">
                <IonContent class="ion-padding">
                    <form onSubmit={updateTicker}>
                        <IonInput
                            value={ticker}
                            placeholder="Update Ticker"
                            required={true}
                            onIonChange={e => setTicker(e.detail.value!)}/>
                    </form>

                </IonContent>
            </IonPopover>
        </>
    );

}

const DeleteTicker: React.FC<{ tag: number }> = ({tag}) => {
    const {fetchTickers} = useContext(TickersContext) as TickerContext;

    const deleteTicker = async () => {
        await fetch(`http://localhost:8000/ticker/${tag}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({tag: tag})
        });
        await fetchTickers();
    };

    return (
        <IonButton onClick={deleteTicker} fill={'clear'}>
            <IonIcon icon={closeCircleOutline} slot={"icon-only"}/>
        </IonButton>
    )
}

const PlotTicker: React.FC = () => {
    const {tickers} = useContext(TickersContext) as TickerContext;

    const [data, setData] = useState<[]>([]);
    const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'magenta'];
    const fetchPlots = async () => {
        const response = await fetch("http://localhost:8000/plot");
        const plot_response = await response.json();

        setData(plot_response.data);
    };

    useEffect(() => {
        fetchPlots().then(r => console.log("fetching plots, response:", r));
    }, []);

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>Tickers Adjusted Closing Prices</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <LineChart
                    width={1000}
                    height={400}
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="x"/>
                    <YAxis/>
                    <Tooltip/>
                    {tickers.map((ticker) => (
                        <Line type="monotone" dataKey={ticker.ticker} stroke={colors[ticker.tag]} dot={false} />
                    ))}
                </LineChart>
            </IonCardContent>
        </IonCard>
    )
}

const ShowStats: React.FC = () => {
    const [stats, setStats] = useState<string>("");
    const fetchStats = async () => {
        const response = await fetch("http://localhost:8000/stats");
        const stats_response = await response.json();
        const stats = JSON.stringify(stats_response, null, 2);

        setStats(stats);
    };

    return (
        <>
            <IonButton
                color={"tertiary"}
                expand={"block"}
                onClick={fetchStats}
            >
                Stats!</IonButton>
            <IonItem>
                <IonLabel position="stacked">Tickers Statistics</IonLabel>
                <IonTextarea
                    disabled={true}
                    autoGrow={true}
                    value={stats}/>
            </IonItem>
        </>

    )
}
export default Tickers;