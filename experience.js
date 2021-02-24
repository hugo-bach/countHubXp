const axios = require('axios');
require('dotenv').config();
const autoLogin = `https://intra.epitech.eu/auth-${process.env.ID_AUTOLOGIN}`;
const readline = require('readline-sync');

const xpAct = [
    {
        key: 1,
        name: 'Talk',
        xpWinPart: 1,
        xpWinOrg: 4,
        xpLostPart: 1,
        limitPart: 15,
        limitOrg: 6,
        nbPart: 0,
        nbOrg: 0,
    },
    {
        key: 2,
        name: 'Workshop',
        xpWinPart: 2,
        xpWinOrg: 7,
        xpLostPart: 2,
        limitPart: 10,
        limitOrg: 3,
        nbPart: 0,
        nbOrg: 0,
    },
    {
        key: 3,
        name: 'Hackathon',
        xpWinPart: 6,
        xpWinOrg: 15,
        xpLostPart: 6,
        limitPart: 100,
        limitOrg: 100,
        nbPart: 0,
        nbOrg: 0,
    },
    {
        key: 4,
        name: 'Experience',
        xpWinPart: 3,
        xpWinOrg: 0,
        xpLostPart: 0,
        limitPart: 8,
        limitOrg: 0,
        nbPart: 0,
        nbOrg: 0,
    },
];

const me = { nbXps: 0, nbXpsSoon: 0, present: [], absent: [], soon: [] };

const requestGet = async (url) => {
    let res;

    try {
        res = await axios.get(url);
    } catch (e) {
        console.log(e);
        throw 'Invalid request';
    }
    return res.data;
};

const getProfil = async () => {
    return await requestGet(`${autoLogin}/user`);
};

const getActivitiesHub = async (region) => {
    return await requestGet(`${autoLogin}/module/2020/B-INN-000/${region}-0-1/?format=json`);
};

const getAllExperiences = async (activities, region, login) => {
    const url = `${autoLogin}/module/2020/B-INN-000/${region?.split('/')[1]}-0-1`;
    try {
        const res = await Promise.all(
            activities.map((act) => {
                return axios.get(`${url}/${act?.codeacti}/note/?format=json`);
            }),
        );
        res?.map((result) => {
            let act;
            if (Object.entries(result.data).length) act = result.data?.find((user) => user.login === login);
            if (act?.note === 100) addActivite('Experience', 'Experience', 'present', act?.date);
        });
    } catch (e) {
        console.log(e);
    }
};

const sortDate = (a, b) => {
    const [dateA, dateB] = [new Date(a.start), new Date(b.start)];

    return dateA - dateB;
};

const addActivite = (title, type, status, date) => {
    const findAct = xpAct.find((act) => act.name === type);
    const { limitPart, xpWinPart, xpWinOrg, nbPart, xpLostPart, nbOrg, limitOrg } = findAct;

    switch (status) {
        case 'present':
            nbPart < limitPart && (me.nbXps += xpWinPart) && (findAct.nbPart += 1);
            me.present.push({ title, type, status, date });
            break;
        case 'absent':
            me.nbXps -= xpLostPart;
            me.absent.push({ title, type, status, date });
            break;
        case 'organisateur':
            nbOrg < limitOrg && (me.nbXps += xpWinOrg) && (findAct.nbOrg += 1);
            me.present.push({ title, type, status: 'organisateur', date });
            break;
        case 'soon':
            me.soon.push({ title, type, status: 'inscrit', date });
            break;
        default:
            break;
    }
};

const checkAbsence = () => {
    const nb = me.absent.length;
    let i = 0;
    while (i < nb) {
        const { title, type, date } = me.absent[0];
        const response = readline.question(`As-tu été absent à cette activitée : ${title}\n[Y/n] `);
        if (response.match(/^n$/)) {
            me.nbXps += xpAct.find((elem) => elem.name === type)?.xpWinPart;
            addActivite(title, type, 'present', date);
            me.absent.shift();
        }
        i++;
    }
};

const countXpSoon = () => {
    me.soon.map((act) => {
        const findAct = xpAct.find((elem) => elem.name === act.type);
        const { xpWinPart, limitPart, nbPart } = findAct;
        nbPart < limitPart && (me.nbXpsSoon += xpWinPart) && findAct.nbPart++;
    });
};

const getXp = async () => {
    const { login, location } = await getProfil();
    const activitiesPays = (await getActivitiesHub(location.split('/')[0]))?.activites;
    const activitiesRegion = (await getActivitiesHub(location.split('/')[1]))?.activites;
    const activities = activitiesPays.concat(activitiesRegion).sort(sortDate);
    const strRegex = xpAct.map((a, index) => {
        const name = `(${a.name})`;
        if (index + 1 !== xpAct.length) return name + '|';
        return name;
    });
    const regexExp = new RegExp(`^${strRegex.join('')}$`);

    activities.map((activite) => {
        const typeAct = regexExp.exec(activite?.type_title);

        if (typeAct)
            activite.events.map((event) => {
                if (event?.user_status) addActivite(activite.title, typeAct[0], event.user_status, event.begin);
                else if (event?.assistants?.find((assistant) => assistant.login === login))
                    addActivite(activite.title, typeAct[0], 'organisateur', event.begin);
                else if (event?.already_register) addActivite(activite.title, typeAct[0], 'soon', event.begin);
            });
    });
    await getAllExperiences(
        activities.filter((activite) => activite?.type_title === 'Experience'),
        location,
        login,
    );
    checkAbsence();
    countXpSoon();
    console.log(me);
};

getXp();
