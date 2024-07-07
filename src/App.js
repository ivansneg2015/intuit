import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './App.css';
import { takeScreenshot } from './screenshotService';
import axios from 'axios';

Chart.register(...registerables);

function App() {
  const [color, setColor] = useState(Math.random() > 0.5 ? 'black' : 'white');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [attempts, setAttempts] = useState(1000);
  const [remainingAttempts, setRemainingAttempts] = useState(100);
  const [trainingTime, setTrainingTime] = useState(5);
  const [timer, setTimer] = useState(300);
  const [isTraining, setIsTraining] = useState(false);
  const [score, setScore] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [showSmoothedChart, setShowSmoothedChart] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Результаты угадываний',
      data: [],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  });
  const chartRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (isTraining && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTraining(false);
      handleTrainingEnd();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTraining, timer]);

  const handleGuess = (guessedColor) => {
    if (remainingAttempts > 0) {
      const newColor = Math.random() > 0.5 ? 'black' : 'white';
      setColor(newColor);
      setGuess(guessedColor);
      const isCorrect = guessedColor === newColor;
      if (isCorrect) {
        setResult('Правильно!');
        setScore(score + 1);
      } else {
        setResult('Неправильно!');
        setScore(score - 1);
      }
      setRemainingAttempts(remainingAttempts - 1);

      const newLabels = [...chartData.labels, chartData.labels.length + 1];
      const newData = [...chartData.datasets[0].data, score];

      setChartData({
        labels: newLabels,
        datasets: [{
          ...chartData.datasets[0],
          data: newData
        }]
      });

      const buttons = document.querySelectorAll('.color-button');
      buttons.forEach(button => button.classList.remove('correct', 'incorrect'));
      const selectedButton = guessedColor === 'black' ? buttons[0] : buttons[1];
      selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');
      setTimeout(() => {
        selectedButton.classList.remove('correct', 'incorrect');
      }, 1000);
    } else {
      setResult('У вас закончились попытки!');
      handleTrainingEnd();
    }
  };

  const handleTrainingEnd = async () => {
    setShowChart(true);
    if (chartRef.current) {
      const screenshot = await takeScreenshot(chartRef.current);
      try {
        await axios.post('http://localhost:3000/send-email', {
          to: 'recipient@example.com',
          subject: 'График угадываний',
          text: 'Прилагаем снимок графика угадываний.',
          attachment: screenshot
        });
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  };

  const startTraining = () => {
    setIsTraining(true);
    setRemainingAttempts(attempts);
    setTimer(trainingTime * 60);
    setColor(Math.random() > 0.5 ? 'black' : 'white');
    setGuess('');
    setResult('');
    setScore(0);
    setShowChart(false);
    setShowSmoothedChart(false);
    setChartData({
      labels: [],
      datasets: [{
        label: 'Результаты угадываний',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    });
  };

  const resetAll = () => {
    setIsTraining(false);
    setRemainingAttempts(attempts);
    setTimer(trainingTime * 60);
    setColor(Math.random() > 0.5 ? 'black' : 'white');
    setGuess('');
    setResult('');
    setScore(0);
    setShowChart(false);
    setShowSmoothedChart(false);
    setChartData({
      labels: [],
      datasets: [{
        label: 'Результаты угадываний',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    });
  };

  const timeOptions = Array.from({ length: 6 }, (_, i) => (i + 1) * 5);
  const attemptOptions = [1000, 2000, 3000, 4000, 5000];

  const movingAverage = (data, windowSize) => {
    if (data.length === 0) {
      return data;
    }
    const smoothed = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
      const window = data.slice(start, end);
      const average = window.reduce((sum, value) => sum + value, 0) / window.length;
      smoothed.push(average);
    }
    return smoothed;
  };

  const smoothedData = movingAverage(chartData.datasets[0].data, 5);

  const chartOptions = {
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 255, 0, 0.1)'
        },
        ticks: {
          color: 'black'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: 'black'
        }
      }
    }
  };

  return (
    <div className="App">
      <h1>Угадай цвет карты</h1>
      {!isTraining ? (
        <div>
          <label>
            Количество попыток:
            <select value={attempts} onChange={(e) => setAttempts(parseInt(e.target.value))}>
              {attemptOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Время тренировки (мин):
            <select value={trainingTime} onChange={(e) => setTrainingTime(parseInt(e.target.value))}>
              {timeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <button onClick={startTraining}>Начать тренировку</button>
        </div>
      ) : (
        <div>
          <div className="color-button-container">
            <button className="color-button black-button" onClick={() => handleGuess('black')}></button>
            <button className="color-button white-button" onClick={() => handleGuess('white')}></button>
          </div>
          <div>
            <button onClick={() => setShowChart(!showChart)}>
              {showChart ? 'Скрыть график' : 'Показать график'}
            </button>
            <button onClick={() => setShowSmoothedChart(!showSmoothedChart)}>
              {showSmoothedChart ? 'Показать график без сглаживания' : 'Показать сглаженный график'}
            </button>
            <button onClick={resetAll}>Сбросить все и начать заново</button>
          </div>
          {guess && (
            <div>
              <p>Ваша догадка: {guess}</p>
              <p>Результат: {result}</p>
              <p>Осталось попыток: {remainingAttempts}</p>
              <p>Осталось времени: {Math.floor(timer / 60)} мин {timer % 60} сек</p>
            </div>
          )}
          {showChart && (
            <div className="chart-container">
              <Line
                ref={chartRef}
                data={{
                  labels: chartData.labels,
                  datasets: [{
                    ...chartData.datasets[0],
                    data: showSmoothedChart ? smoothedData : chartData.datasets[0].data
                  }]
                }}
                options={chartOptions}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;