from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pandas_datareader import data as wb
import numpy

app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


@app.get("/")
async def root() -> dict:
    return {"message": "Hello World!"}

tickers = [
    {
        "tag": "1",
        "ticker": "MGLU3.SA",
    },
    {
        "tag": "2",
        "ticker": 'PETR4.SA',
    },
]

@app.get("/ticker")
async def get_tickers() -> dict:
    return {"data": tickers}

@app.post("/ticker")
async def add_ticker(ticker: dict) -> dict:
    tickers.append(ticker)
    return {"message": "Ticker added!"}

@app.put("/ticker/{tag}")
async def update_ticker(tag: int, body: dict) -> dict:
    for ticker in tickers:
        if int(ticker["tag"]) == tag:
            ticker["ticker"] = body["ticker"]
            return {"message": f"Ticker with tag {tag} has been updated!"}

@app.delete("/ticker/{tag}")
async def delete_ticker(tag: int) -> dict:
    for ticker in tickers:
        if int(ticker["tag"]) == tag:
            tickers.remove(ticker)

    for index, ticker in enumerate(tickers):
        ticker["tag"] = index + 1

    return {"message": f"Ticker with tag {tag} has been removed!"}

data = pd.DataFrame()

@app.get("/plot")
async def plot_tickers() -> dict:
    ticker_list = [v['ticker'] for v in tickers]

    for ticker in ticker_list:
        if ticker not in data:
            data[ticker] = wb.DataReader(ticker, data_source='yahoo',
                                     start='2021-08-11',
                                     end='2022-08-11')['Adj Close']
    plot = [{"x": val} for val in data[ticker_list[0]].index.format()]
    for ticker in ticker_list:
        for i, obj in enumerate(plot):
            obj.update({ticker: data[ticker].values[i]})


    return {"data": plot}

@app.get("/stats")
async def get_statistics() -> dict:
    returns = pd.DataFrame()
    tickers_list = [v['ticker'] for v in tickers]
    
    for ticker in tickers_list:
        returns[ticker] = ((data[ticker] / data[ticker].shift(1)) - 1) * 100
        
    avg = {}
    std = {}
    for ticker in tickers_list:
        avg[ticker] = returns[ticker].mean() * 250
        std[ticker] = returns[ticker].std() * numpy.sqrt(250)
    
    return {"stats": {"avg":avg, "std":std}}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000, workers = 1)