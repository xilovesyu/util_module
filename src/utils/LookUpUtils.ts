//import { LookupsApiService } from '@personaApp/persona-app-dxpApi'
import axios from 'axios'

//temp
const LookupsApiService = () => {
  
}
LookupsApiService.prototype.loadLookupAttributes = (lookupName: string, config?: any) => {
  return axios.get('your api')
}

export const LookUpAttributes: any = new Map()

export const getLookUpAttributes = async (lookupName: string) => {
    if (!LookUpAttributes.get(lookupName)) {
        const lookupsApiService = new LookupsApiService()
        await lookupsApiService.loadLookupAttributes(lookupName, {showAlertBar: false}).then((response: any) => {
            const data = response.data
            LookUpAttributes.set(lookupName, data)
        }).catch((error: any) => {
            console.log(error)
        })
    }

    return LookUpAttributes.get(lookupName)
}
