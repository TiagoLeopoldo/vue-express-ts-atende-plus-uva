import axios from 'axios';

export class OpenWeatherService {
  public async getWeatherForecast(date: Date, city: string = 'São Paulo'): Promise<string> {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) throw new Error('OpenWeather API Key não configurada');

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`
      );

      const targetDate = date.toISOString().split('T')[0];
      
      const forecast = response.data.list.find((item: any) => 
        item.dt_txt.startsWith(targetDate)
      );

      if (forecast) {
        return `${forecast.weather[0].description}, ${forecast.main.temp}°C`;
      }

      return 'Previsão indisponível para esta data';
    } catch (error) {
      console.error('Erro na API OpenWeather:', error);
      return 'Erro ao buscar previsão';
    }
  }
}
