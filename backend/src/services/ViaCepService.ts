import axios from 'axios';

export class ViaCepService {
  public async getAddressByCep(cep: string): Promise<any> {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar CEP');
    }
  }
}
