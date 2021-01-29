'use strict';

import axios from 'axios';

const options = {
  baseURL: 'https://intra.epitech.eu/',
  responseType: 'json',
  timeout: 5000,
};

/**
 * @param  {any} error
 */
function responseErrorInterceptor(error) {
  if (error.response && error.response.data.message) {
    return Promise.reject(error.response.data.message);
  } else {
    return Promise.reject(error.message);
  }
}

export class IntraApi {
  /**
   * @private
   * @type {AxiosInstance}
   */
  _api;

  /**
   * Constructor
   * @param  {{token:string}} credentials token
   * @return {IntraApi}
   */
  constructor(credentials) {
    if (!credentials) {
      throw 'Missing credentials';
    } else if (!credentials.token) {
      throw 'A token is needed to authenticate';
    }

    this._api = axios.create({
      ...options,
      baseURL: `${options.baseURL}auth-${credentials.token}/`,
    });
    this._api.interceptors.response.use((rep) => rep, responseErrorInterceptor);
  }

  /**
   * Get user info
   * @async
   * @return {Promise<{login: string, title: string,internal_email: string,lastname: string,firstname: string,userinfo: any,referent_used: boolean,picture: string,picture_fun: string,scolaryear: string,promo: number,semester: number,location: string,documents: string,userdocs: null,shell: null,close: boolean,ctime: string,mtime: string,id_promo: string,id_history: string,course_code: string,semester_code: string,school_id: string,school_code: string,school_title: string,old_id_promo: string,old_id_location: string,rights: any,invited: boolean,studentyear: number,admin: boolean,editable: boolean,restrictprofiles: boolean,groups: { title: string, name: string, count: number }[],events: any[],credits: number,gpa: { gpa: string, cycle: string }[],spice: null,nsstat: { active: number, idle: number, out_active: number, out_idle: number, nslog_norm: number }}>}
   * @throws
   */
  async getUser() {
    const { data } = await this._call('GET', '/user/?format=json');
    return data;
  }

  /**
   * Get user info
   * @async
   * @param  {'FR'|'TIR'|'BRU'|'COT'|'CHQ'|'DAL'|'BER'|'BAR'|'BDX'|'LIL'|'LYN'|'MAR'|'MLH'|'MLN'|'MPL'|'NAN'|'NCE'|'NCY'|'PAR'|'REN'|'RUN'|'STG'|'TLS'} region zip code of Hub activities location
   * @return {Promise<{scolaryear: string,codemodule: string,codeinstance: string,semester: number,scolaryear_template: string,title: string,begin: string,end_register: string,end: string,past: string,closed: string,opened: string,user_credits: string,credits: number,description: string,competence: null,flags: string,instance_flags: string,max_ins: null,instance_location: string,hidden: string,old_acl_backup: null,resp: {type: string,login: string,title: string,picture: null}[],assistant: any[],rights: null,template_resp: {type: string,login: string,title: string,picture: null}[],allow_register: number,date_ins: string,student_registered: number,student_grade: string,student_credits: number,color: string,student_flags: string,current_resp: boolean,activites: {codeacti: string,call_ihk: null,slug: null,instance_location: string,module_title: string,title: string,description: string,type_title: string,type_code: string,begin: string,start: string,end_register: null,deadline: null,end: string,nb_hours: string,nb_group: number,num: number,register: string,register_by_bloc: string,register_prof: string,title_location_type: null,is_projet: boolean,id_projet: null,project_title: null,is_note: boolean,nb_notes: null,is_blocins: boolean,rdv_status: string,id_bareme: null,title_bareme: null,archive: string,hash_elearning: null,ged_node_adm: null,nb_planified: number,hidden: boolean,project: null,events: {code: string,num_event: string,seats: string,title: null,description: null,nb_inscrits: string,begin: string,end: string,id_activite: string,location: string,nb_max_students_projet: null,already_register: null,user_status: string,allow_token: string,assistants: {login: string,title: string,picture: string,manager_status: string}[]}[]}[]}>}
   * @throws
   */
  async getHubModule(region) {
    const { data } = await this._call('GET', `/module/2020/B-INN-000/${region}-0-1/?format=json`);
    return data;
  }

  /**
   * Ping the Epitech server
   * @return {Promise<number>} the response time in milliseconds
   * @throws
   */
  static async ping() {
    const api = axios.create({
      ...options,
      validateStatus: (status) => {
        return (status >= 200 && status < 300) || status === 403;
      },
    });

    // Add timestamps to requests and responses
    api.interceptors.request.use(
      (config) => {
        config.startTimestamp = Date.now();
        return config;
      },
      (error) => Promise.reject(error)
    );
    api.interceptors.response.use((response) => {
      response.config.endTimestamp = Date.now();
      return response;
    }, responseErrorInterceptor);

    const res = await api.get('/?format=json');
    return res.config.endTimestamp - res.config.startTimestamp;
  }

  /**
   * Make a generic call to the Epitech intra API
   * @private
   * @param  {string} method - HTTP method to use
   * @param  {string} endpoint - remote endpoint to use
   * @param  {any} [data=undefined] - request body additionnal data
   * @return {Promise<AxiosResponse<any>>} the request
   * @throws
   */
  async _call(method, endpoint, data = undefined) {
    const body = { user: this._email, data };

    return this._api.request({
      method,
      url: endpoint,
      data: body,
    });
  }
}
