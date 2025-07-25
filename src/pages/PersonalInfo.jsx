import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';
import pricingApi from '../services/pricingApi';
import logo from '../assets/login_logo.png';
import LanguageSelector from '../components/LanguageSelector';
import { User, MapPin, Phone, Building, DollarSign } from 'lucide-react';

// Rwanda districts array (same as Profile.jsx)
const rwandaDistricts = [
  'Bugesera',
  'Burera',
  'Gakenke',
  'Gasabo',
  'Gatsibo',
  'Gicumbi',
  'Gisagara',
  'Huye',
  'Kamonyi',
  'Karongi',
  'Kayonza',
  'Kicukiro',
  'Kirehe',
  'Muhanga',
  'Musanze',
  'Ngoma',
  'Ngororero',
  'Nyabihu',
  'Nyagatare',
  'Nyamagabe',
  'Nyamasheke',
  'Nyanza',
  'Nyarugenge',
  'Nyaruguru',
  'Rubavu',
  'Ruhango',
  'Rulindo',
  'Rusizi',
  'Rutsiro',
  'Rwamagana'
];

// District-Sector mapping
const districtSectorMapping = {
  'Gasabo': [
    'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali', 'Kacyiru', 
    'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 
    'Rusororo', 'Rutunga'
  ],
  'Kicukiro': [
    'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 
    'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga'
  ],
  'Nyarugenge': [
    'Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Mageragere', 'Muhima', 
    'Nyakabanda', 'Nyamirambo', 'Nyarugenge', 'Rwezamenyo'
  ],
  'Bugesera': [
    'Gashora', 'Juru', 'Kamabuye', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 
    'Ngeruka', 'Ntarama', 'Nyamata', 'Nyarugenge', 'Rilima', 'Ruhuha', 
    'Rweru', 'Shyara'
  ],
  'Burera': [
    'Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe', 'Gitovu', 
    'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 
    'Rugengabari', 'Ruhunde', 'Rusarabuye', 'Rwerere'
  ],
  'Gakenke': [
    'Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashyita', 'Janja', 'Kamubuga', 
    'Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Mugunga', 'Muhondo', 
    'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi'
  ],
  'Gatsibo': [
    'Gahini', 'Gasange', 'Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 
    'Kiziguro', 'Muhura', 'Murambi', 'Ngarama', 'Nyagihanga', 'Remera', 
    'Rugarama', 'Rwimbogo'
  ],
  'Gicumbi': [
    'Bukure', 'Bwisige', 'Byumba', 'Cyumba', 'Giti', 'Kaniga', 'Manyagiro', 
    'Miyove', 'Kageyo', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 
    'Nyankenke', 'Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Shangasha', 'Tumba'
  ],
  'Gisagara': [
    'Gikonko', 'Gishubi', 'Kansi', 'Kibirizi', 'Kigembe', 'Mamba', 'Muganza', 
    'Mugombwa', 'Mukindo', 'Musha', 'Ndora', 'Nyanza', 'Save'
  ],
  'Huye': [
    'Busanze', 'Butare', 'Gahororo', 'Gashora', 'Gikundamvura', 'Kigembe', 
    'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 
    'Rweru', 'Shyara'
  ],
  'Kamonyi': [
    'Gacurabwenge', 'Karama', 'Kayenzi', 'Kibuye', 'Mugina', 'Musambira', 
    'Ngamba', 'Nyamiyaga', 'Nyarubaka', 'Rugalika', 'Rukoma', 'Runda'
  ],
  'Karongi': [
    'Bwishyura', 'Gashari', 'Gishyita', 'Gisovu', 'Gitesi', 'Mubuga', 'Murambi', 
    'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba'
  ],
  'Kayonza': [
    'Gahini', 'Kabarondo', 'Karengera', 'Kaziba', 'Kibungo', 'Mukarange', 
    'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Ruramira', 'Rwinkwavu'
  ],
  'Kirehe': [
    'Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga', 
    'Musaza', 'Mushikiri', 'Nasho', 'Nyamugari', 'Nyarubuye', 'Rwabukenge', 'Rwanyamuhanga'
  ],
  'Muhanga': [
    'Cyeza', 'Gacurabwenge', 'Gashali', 'Gitarama', 'Kibangu', 'Kiyumba', 
    'Muhanga', 'Munyinya', 'Musezero', 'Muyira', 'Nkinda', 'Nyabinoni', 
    'Nyamabuye', 'Nyarusange', 'Rongi', 'Rugendabari', 'Shyogwe'
  ],
  'Musanze': [
    'Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 
    'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro'
  ],
  'Ngoma': [
    'Gashanda', 'Jarama', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama', 
    'Mutenderi', 'Remera', 'Rukira', 'Rukumberi', 'Rurenge', 'Sake', 'Zaza'
  ],
  'Ngororero': [
    'Bwira', 'Gatumba', 'Hindiro', 'Kabaya', 'Kageyo', 'Kavumu', 'Matyazo', 
    'Muhanda', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange', 'Sovu'
  ],
  'Nyabihu': [
    'Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 
    'Muringa', 'Rambura', 'Rugera', 'Rurembo', 'Shyira'
  ],
  'Nyagatare': [
    'Gatunda', 'Kiyombe', 'Karama', 'Musheli', 'Nyagatare', 'Rukomo', 
    'Rwempasha', 'Rwimiyaga', 'Tabagwe'
  ],
  'Nyamagabe': [
    'Buruhukiro', 'Cyanika', 'Gasaka', 'Gatare', 'Kaduha', 'Kamegeli', 
    'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mugano', 'Musange', 'Musebeya', 
    'Mushubi', 'Nkomane', 'Tare', 'Uwinkingi'
  ],
  'Nyamasheke': [
    'Bushekeri', 'Bushenge', 'Cyato', 'Gihombo', 'Kagano', 'Kanjongo', 
    'Karambi', 'Karengera', 'Kirimbi', 'Macuba', 'Mahembe', 'Nyabitekeri', 
    'Rangiro', 'Ruharambuga', 'Shangi'
  ],
  'Nyanza': [
    'Busasamana', 'Busoro', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 
    'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma'
  ],
  'Nyaruguru': [
    'Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Mata', 'Muganza', 'Munini', 
    'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Ruheru', 'Ruramba', 'Rusenge'
  ],
  'Rubavu': [
    'Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze', 
    'Mudende', 'Nyakiriba', 'Nyamyumba', 'Nyundo', 'Rubavu', 'Rugerero'
  ],
  'Ruhango': [
    'Bweramana', 'Byimana', 'Kabagali', 'Kinazi', 'Kinihira', 'Mbuye', 
    'Mukingo', 'Muyira', 'Ntongwe', 'Ruhango', 'Rusatira', 'Rweru', 'Shyira'
  ],
  'Rulindo': [
    'Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira', 
    'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Nkoto', 'Rusiga', 'Rutare'
  ],
  'Rusizi': [
    'Bugarama', 'Butare', 'Bweyeye', 'Gashonga', 'Giheke', 'Gihundwe', 
    'Gikundamvura', 'Gitambi', 'Kamembe', 'Muganza', 'Mururu', 'Nkanka', 
    'Nkombo', 'Nkungu', 'Nyakabuye', 'Nyakarenzo', 'Nzahaha', 'Rwimbogo'
  ],
  'Rutsiro': [
    'Boneza', 'Gihango', 'Kigeyo', 'Kivumu', 'Manihira', 'Mukura', 'Murunda', 
    'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango', 'Rusebeya', 'Rusizi'
  ],
  'Rwamagana': [
    'Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Muhazi', 
    'Munyaga', 'Munyiginya', 'Musaza', 'Mushonyi', 'Muyumbu', 'Mwulire', 
    'Nyakaliro', 'Nzige', 'Rubona', 'Rukoma', 'Rukura', 'Rukura', 'Rurenge'
  ]
};

// Sector-Cell mapping
const sectorCellMapping = {
  // Gasabo District Sectors
  'Bumbogo': ['Kinyaga', 'Musave', 'Mvuzo', 'Ngara', 'Nkuzuzu', 'Nyabikenke', 'Nyagasozi'],
  'Gatsata': ['Karuruma', 'Nyamabuye', 'Nyamugari'],
  'Gikomero': ['Gasagara', 'Gicaca', 'Kibara', 'Munini', 'Murambi'],
  'Gisozi': ['Musezero', 'Ruhango'],
  'Jabana': ['Akamatamu', 'Bweramvura', 'Kabuye', 'Kidashya', 'Ngiryi'],
  'Jali': ['Agateko', 'Buhiza', 'Muko', 'Nkusi', 'Nyabuliba', 'Nyakabungo', 'Nyamitanga'],
  'Kacyiru': ['Kamatamu', 'Kamutwa', 'Kibaza'],
  'Kimihurura': ['Kamukina', 'Kimihurura', 'Rugando'],
  'Kimironko': ['Bibare', 'Kibagabaga', 'Nyagatovu'],
  'Kinyinya': ['Gacuriro', 'Gasharu', 'Kagugu', 'Murama'],
  'Ndera': ['Bwiza', 'Cyaruzinge', 'Kibenga', 'Masoro', 'Mukuyu', 'Rudashya'],
  'Nduba': ['Butare', 'Gasanze', 'Gasura', 'Gatunga', 'Muremure', 'Sha'],
  'Remera': ['Nyabisindu', 'Nyarutarama'],
  'Rusororo': ['Kabuga I', 'Kabuga II', 'Gasanze', 'Nyagahinga'],
  'Rutunga': ['Gako', 'Kabuga', 'Karuruma', 'Kinyaga', 'Munini', 'Ngenda', 'Nyagahinga', 'Rudakabukirwa'],
  
  // Kicukiro District Sectors
  'Gahanga': ['Gahanga', 'Kagasa', 'Karembure'],
  'Gatenga': ['Gatenga', 'Karambo', 'Nyanza', 'Nyarurama'],
  'Gikondo': ['Gikondo', 'Gatenga', 'Karugira'],
  'Kagarama': ['Kagarama', 'Kanserege', 'Rukatsa'],
  'Kanombe': ['Busanza', 'Kabeza', 'Karama', 'Rubirizi'],
  'Kicukiro': ['Kicukiro', 'Gasharu', 'Kagina'],
  'Kigarama': ['Kigarama', 'Nyenyeri', 'Rwimbogo'],
  'Masaka': ['Masaka', 'Karama', 'Rwimbogo'],
  'Niboye': ['Niboye', 'Nyakabanda', 'Gasharu'],
  'Nyarugunga': ['Kamashashi', 'Nonko', 'Rwimbogo'],
  
  // Nyarugenge District Sectors
  'Gitega': ['Akabahizi', 'Akabeza', 'Gacyamo', 'Kigarama', 'Kinyange', 'Kora'],
  'Kanyinya': ['Nyamweru', 'Nzove', 'Taba'],
  'Kigali': ['Kigali', 'Mwendo', 'Nyabugogo', 'Ruriba', 'Rwesero'],
  'Kimisagara': ['Kamuhoza', 'Katabaro', 'Kimisagara'],
  'Mageragere': ['Kankuba', 'Kavumu', 'Mataba', 'Ntungamo', 'Nyarufunzo', 'Nyarurenzi', 'Runzenze'],
  'Muhima': ['Amahoro', 'Kabasengerezi', 'Kabeza', 'Nyabugogo', 'Rugenge', 'Tetero', 'Ubumwe'],
  'Nyakabanda': ['Munanira I', 'Munanira II', 'Nyakabanda I', 'Nyakabanda II'],
  'Nyamirambo': ['Cyivugiza', 'Gasharu', 'Mumena', 'Rugarama'],
  'Nyarugenge': ['Agatare', 'Biryogo', 'Kiyovu', 'Rwampara'],
  'Rwezamenyo': ['Kabuguru I', 'Kabuguru II', 'Rwezamenyo I', 'Rwezamenyo II'],
  
  // Bugesera District Sectors
  'Gashora': ['Gashora', 'Juru', 'Kamabuye', 'Mareba', 'Mayange'],
  'Juru': ['Juru', 'Kamabuye', 'Mareba', 'Mayange', 'Musenyi'],
  'Kamabuye': ['Kamabuye', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo'],
  'Mareba': ['Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka'],
  'Mayange': ['Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama'],
  'Musenyi': ['Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Nyamata'],
  'Mwogo': ['Mwogo', 'Ngeruka', 'Ntarama', 'Nyamata', 'Nyarugenge'],
  'Ngeruka': ['Ngeruka', 'Ntarama', 'Nyamata', 'Nyarugenge', 'Rilima'],
  'Ntarama': ['Ntarama', 'Nyamata', 'Nyarugenge', 'Rilima', 'Ruhuha'],
  'Nyamata': ['Nyamata', 'Nyarugenge', 'Rilima', 'Ruhuha', 'Rweru'],
  'Nyarugenge': ['Nyarugenge', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara'],
  'Rilima': ['Rilima', 'Ruhuha', 'Rweru', 'Shyara'],
  'Ruhuha': ['Ruhuha', 'Rweru', 'Shyara'],
  'Rweru': ['Rweru', 'Shyara'],
  'Shyara': ['Shyara'],
  
  // Burera District Sectors
  'Bungwe': ['Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga'],
  'Butaro': ['Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe'],
  'Cyanika': ['Cyanika', 'Cyeru', 'Gahunga', 'Gatebe', 'Gitovu'],
  'Cyeru': ['Cyeru', 'Gahunga', 'Gatebe', 'Gitovu', 'Kagogo'],
  'Gahunga': ['Gahunga', 'Gatebe', 'Gitovu', 'Kagogo', 'Kinoni'],
  'Gatebe': ['Gatebe', 'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa'],
  'Gitovu': ['Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye'],
  'Kagogo': ['Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba'],
  'Kinoni': ['Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama'],
  'Kinyababa': ['Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 'Rugengabari'],
  'Kivuye': ['Kivuye', 'Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde'],
  'Nemba': ['Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde', 'Rusarabuye'],
  'Rugarama': ['Rugarama', 'Rugengabari', 'Ruhunde', 'Rusarabuye', 'Rwerere'],
  'Rugengabari': ['Rugengabari', 'Ruhunde', 'Rusarabuye', 'Rwerere'],
  'Ruhunde': ['Ruhunde', 'Rusarabuye', 'Rwerere'],
  'Rusarabuye': ['Rusarabuye', 'Rwerere'],
  'Rwerere': ['Rwerere'],
  
  // Gakenke District Sectors
  'Busengo': ['Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashyita'],
  'Coko': ['Coko', 'Cyabingo', 'Gakenke', 'Gashyita', 'Janja'],
  'Cyabingo': ['Cyabingo', 'Gakenke', 'Gashyita', 'Janja', 'Kamubuga'],
  'Gakenke': ['Gakenke', 'Gashyita', 'Janja', 'Kamubuga', 'Karambo'],
  'Gashyita': ['Gashyita', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga'],
  'Janja': ['Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba'],
  'Kamubuga': ['Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi'],
  'Karambo': ['Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Mugunga'],
  'Kivuruga': ['Kivuruga', 'Mataba', 'Minazi', 'Mugunga', 'Muhondo'],
  'Mataba': ['Mataba', 'Minazi', 'Mugunga', 'Muhondo', 'Muyongwe'],
  'Minazi': ['Minazi', 'Mugunga', 'Muhondo', 'Muyongwe', 'Muzo'],
  'Mugunga': ['Mugunga', 'Muhondo', 'Muyongwe', 'Muzo', 'Nemba'],
  'Muhondo': ['Muhondo', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli'],
  'Muyongwe': ['Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa'],
  'Muzo': ['Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi'],
  'Nemba': ['Nemba', 'Ruli', 'Rusasa', 'Rushashi'],
  'Ruli': ['Ruli', 'Rusasa', 'Rushashi'],
  'Rusasa': ['Rusasa', 'Rushashi'],
  'Rushashi': ['Rushashi'],
  
  // Add more sector-cell mappings for other districts...
  // For brevity, I'll include a few more key districts
  
  // Huye District Sectors
  'Busanze': ['Busanze', 'Butare', 'Gahororo', 'Gashora', 'Gikundamvura'],
  'Butare': ['Butare', 'Gahororo', 'Gashora', 'Gikundamvura', 'Kigembe'],
  'Gahororo': ['Gahororo', 'Gashora', 'Gikundamvura', 'Kigembe', 'Mareba'],
  'Gashora': ['Gashora', 'Gikundamvura', 'Kigembe', 'Mareba', 'Mayange'],
  'Gikundamvura': ['Gikundamvura', 'Kigembe', 'Mareba', 'Mayange', 'Musenyi'],
  'Kigembe': ['Kigembe', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo'],
  'Mareba': ['Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka'],
  'Mayange': ['Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama'],
  'Musenyi': ['Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha'],
  'Mwogo': ['Mwogo', 'Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru'],
  'Ngeruka': ['Ngeruka', 'Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Ntarama': ['Ntarama', 'Ruhuha', 'Rweru', 'Shyara'],
  'Ruhuha': ['Ruhuha', 'Rweru', 'Shyara'],
  'Rweru': ['Rweru', 'Shyara'],
  'Shyara': ['Shyara'],
  
  // Muhanga District Sectors
  'Cyeza': ['Cyeza', 'Gacurabwenge', 'Gashali', 'Gitarama', 'Kibangu'],
  'Gacurabwenge': ['Gacurabwenge', 'Gashali', 'Gitarama', 'Kibangu', 'Kiyumba'],
  'Gashali': ['Gashali', 'Gitarama', 'Kibangu', 'Kiyumba', 'Muhanga'],
  'Gitarama': ['Gitarama', 'Kibangu', 'Kiyumba', 'Muhanga', 'Munyinya'],
  'Kibangu': ['Kibangu', 'Kiyumba', 'Muhanga', 'Munyinya', 'Musezero'],
  'Kiyumba': ['Kiyumba', 'Muhanga', 'Munyinya', 'Musezero', 'Muyira'],
  'Muhanga': ['Muhanga', 'Munyinya', 'Musezero', 'Muyira', 'Nkinda'],
  'Munyinya': ['Munyinya', 'Musezero', 'Muyira', 'Nkinda', 'Nyabinoni'],
  'Musezero': ['Musezero', 'Muyira', 'Nkinda', 'Nyabinoni', 'Nyamabuye'],
  'Muyira': ['Muyira', 'Nkinda', 'Nyabinoni', 'Nyamabuye', 'Nyarusange'],
  'Nkinda': ['Nkinda', 'Nyabinoni', 'Nyamabuye', 'Nyarusange', 'Rongi'],
  'Nyabinoni': ['Nyabinoni', 'Nyamabuye', 'Nyarusange', 'Rongi', 'Rugendabari'],
  'Nyamabuye': ['Nyamabuye', 'Nyarusange', 'Rongi', 'Rugendabari', 'Shyogwe'],
  'Nyarusange': ['Nyarusange', 'Rongi', 'Rugendabari', 'Shyogwe'],
  'Rongi': ['Rongi', 'Rugendabari', 'Shyogwe'],
  'Rugendabari': ['Rugendabari', 'Shyogwe'],
  'Shyogwe': ['Shyogwe'],
  
  // Kayonza District Sectors
  'Gahini': ['Gahini', 'Kabarondo', 'Karengera', 'Kaziba', 'Kibungo'],
  'Kabarondo': ['Kabarondo', 'Karengera', 'Kaziba', 'Kibungo', 'Mukarange'],
  'Karengera': ['Karengera', 'Kaziba', 'Kibungo', 'Mukarange', 'Murama'],
  'Kaziba': ['Kaziba', 'Kibungo', 'Mukarange', 'Murama', 'Murundi'],
  'Kibungo': ['Kibungo', 'Mukarange', 'Murama', 'Murundi', 'Mwiri'],
  'Mukarange': ['Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego'],
  'Murama': ['Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama'],
  'Murundi': ['Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara'],
  'Mwiri': ['Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Ruramira'],
  'Ndego': ['Ndego', 'Nyamirama', 'Rukara', 'Ruramira', 'Rwinkwavu'],
  'Nyamirama': ['Nyamirama', 'Rukara', 'Ruramira', 'Rwinkwavu'],
  'Rukara': ['Rukara', 'Ruramira', 'Rwinkwavu'],
  'Ruramira': ['Ruramira', 'Rwinkwavu'],
  'Rwinkwavu': ['Rwinkwavu'],
  
  // Gatsibo District Sectors
  'Gatsibo_Gahini': ['Gahini', 'Gasange', 'Gatsibo', 'Gitoki', 'Kabarore'],
  'Gasange': ['Gasange', 'Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo'],
  'Gatsibo': ['Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi'],
  'Gitoki': ['Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro'],
  'Kabarore': ['Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura'],
  'Kageyo': ['Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi'],
  'Kiramuruzi': ['Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama'],
  'Kiziguro': ['Kiziguro', 'Muhura', 'Murambi', 'Ngarama', 'Nyagihanga'],
  'Muhura': ['Muhura', 'Murambi', 'Ngarama', 'Nyagihanga', 'Remera'],
  'Murambi': ['Murambi', 'Ngarama', 'Nyagihanga', 'Remera', 'Rugarama'],
  'Ngarama': ['Ngarama', 'Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo'],
  'Nyagihanga': ['Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo'],
  'Gatsibo_Remera': ['Remera', 'Rugarama', 'Rwimbogo'],
  'Rugarama': ['Rugarama', 'Rwimbogo'],
  'Rwimbogo': ['Rwimbogo'],
  
  // Gicumbi District Sectors
  'Bukure': ['Bukure', 'Bwisige', 'Byumba', 'Cyumba', 'Giti'],
  'Bwisige': ['Bwisige', 'Byumba', 'Cyumba', 'Giti', 'Kaniga'],
  'Byumba': ['Byumba', 'Cyumba', 'Giti', 'Kaniga', 'Manyagiro'],
  'Cyumba': ['Cyumba', 'Giti', 'Kaniga', 'Manyagiro', 'Miyove'],
  'Giti': ['Giti', 'Kaniga', 'Manyagiro', 'Miyove', 'Kageyo'],
  'Kaniga': ['Kaniga', 'Manyagiro', 'Miyove', 'Kageyo', 'Mukarange'],
  'Manyagiro': ['Manyagiro', 'Miyove', 'Kageyo', 'Mukarange', 'Muko'],
  'Miyove': ['Miyove', 'Kageyo', 'Mukarange', 'Muko', 'Mutete'],
  'Kageyo': ['Kageyo', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga'],
  'Mukarange': ['Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke'],
  'Muko': ['Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke', 'Rubaya'],
  'Mutete': ['Mutete', 'Nyamiyaga', 'Nyankenke', 'Rubaya', 'Rukomo'],
  'Nyamiyaga': ['Nyamiyaga', 'Nyankenke', 'Rubaya', 'Rukomo', 'Rushaki'],
  'Nyankenke': ['Nyankenke', 'Rubaya', 'Rukomo', 'Rushaki', 'Rutare'],
  'Rubaya': ['Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune'],
  'Rukomo': ['Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Shangasha'],
  'Rushaki': ['Rushaki', 'Rutare', 'Ruvune', 'Shangasha', 'Tumba'],
  'Rutare': ['Rutare', 'Ruvune', 'Shangasha', 'Tumba'],
  'Ruvune': ['Ruvune', 'Shangasha', 'Tumba'],
  'Shangasha': ['Shangasha', 'Tumba'],
  'Tumba': ['Tumba'],
  
  // Gisagara District Sectors
  'Gikonko': ['Gikonko', 'Gishubi', 'Kansi', 'Kibirizi', 'Kigembe'],
  'Gishubi': ['Gishubi', 'Kansi', 'Kibirizi', 'Kigembe', 'Mamba'],
  'Kansi': ['Kansi', 'Kibirizi', 'Kigembe', 'Mamba', 'Muganza'],
  'Kibirizi': ['Kibirizi', 'Kigembe', 'Mamba', 'Muganza', 'Mugombwa'],
  'Kigembe': ['Kigembe', 'Mamba', 'Muganza', 'Mugombwa', 'Mukindo'],
  'Mamba': ['Mamba', 'Muganza', 'Mugombwa', 'Mukindo', 'Musha'],
  'Muganza': ['Muganza', 'Mugombwa', 'Mukindo', 'Musha', 'Ndora'],
  'Mugombwa': ['Mugombwa', 'Mukindo', 'Musha', 'Ndora', 'Nyanza'],
  'Mukindo': ['Mukindo', 'Musha', 'Ndora', 'Nyanza', 'Save'],
  'Musha': ['Musha', 'Ndora', 'Nyanza', 'Save'],
  'Ndora': ['Ndora', 'Nyanza', 'Save'],
  'Nyanza': ['Nyanza', 'Save'],
  'Save': ['Save'],
  
  // Kamonyi District Sectors
  'Gacurabwenge': ['Gacurabwenge', 'Karama', 'Kayenzi', 'Kibuye', 'Mugina'],
  'Karama': ['Karama', 'Kayenzi', 'Kibuye', 'Mugina', 'Musambira'],
  'Kayenzi': ['Kayenzi', 'Kibuye', 'Mugina', 'Musambira', 'Ngamba'],
  'Kibuye': ['Kibuye', 'Mugina', 'Musambira', 'Ngamba', 'Nyamiyaga'],
  'Mugina': ['Mugina', 'Musambira', 'Ngamba', 'Nyamiyaga', 'Nyarubaka'],
  'Musambira': ['Musambira', 'Ngamba', 'Nyamiyaga', 'Nyarubaka', 'Rugalika'],
  'Ngamba': ['Ngamba', 'Nyamiyaga', 'Nyarubaka', 'Rugalika', 'Rukoma'],
  'Nyamiyaga': ['Nyamiyaga', 'Nyarubaka', 'Rugalika', 'Rukoma', 'Runda'],
  'Nyarubaka': ['Nyarubaka', 'Rugalika', 'Rukoma', 'Runda'],
  'Rugalika': ['Rugalika', 'Rukoma', 'Runda'],
  'Rukoma': ['Rukoma', 'Rukura', 'Rurenge'],
  'Rukura': ['Rukura', 'Rurenge'],
  'Rurenge': ['Rurenge'],
  
  // Karongi District Sectors
  'Bwishyura': ['Bwishyura', 'Gashari', 'Gishyita', 'Gisovu', 'Gitesi'],
  'Gashari': ['Gashari', 'Gishyita', 'Gisovu', 'Gitesi', 'Mubuga'],
  'Gishyita': ['Gishyita', 'Gisovu', 'Gitesi', 'Mubuga', 'Murambi'],
  'Gisovu': ['Gisovu', 'Gitesi', 'Mubuga', 'Murambi', 'Murundi'],
  'Gitesi': ['Gitesi', 'Mubuga', 'Murambi', 'Murundi', 'Mutuntu'],
  'Mubuga': ['Mubuga', 'Murambi', 'Murundi', 'Mutuntu', 'Rubengera'],
  'Murambi': ['Murambi', 'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano'],
  'Murundi': ['Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda'],
  'Mutuntu': ['Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba'],
  'Rubengera': ['Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba'],
  'Rugabano': ['Rugabano', 'Ruganda', 'Rwankuba', 'Twumba'],
  'Ruganda': ['Ruganda', 'Rwankuba', 'Twumba'],
  'Rwankuba': ['Rwankuba', 'Twumba'],
  'Twumba': ['Twumba'],
  
  // Kirehe District Sectors
  'Gahara': ['Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe'],
  'Gatore': ['Gatore', 'Kigarama', 'Kigina', 'Kirehe', 'Mahama'],
  'Kigarama': ['Kigarama', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga'],
  'Kigina': ['Kigina', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza'],
  'Kirehe': ['Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Mushikiri'],
  'Mahama': ['Mahama', 'Mpanga', 'Musaza', 'Mushikiri', 'Nasho'],
  'Mpanga': ['Mpanga', 'Musaza', 'Mushikiri', 'Nasho', 'Nyamugari'],
  'Musaza': ['Musaza', 'Mushikiri', 'Nasho', 'Nyamugari', 'Nyarubuye'],
  'Mushikiri': ['Mushikiri', 'Nasho', 'Nyamugari', 'Nyarubuye', 'Rwabukenge'],
  'Nasho': ['Nasho', 'Nyamugari', 'Nyarubuye', 'Rwabukenge', 'Rwanyamuhanga'],
  'Nyamugari': ['Nyamugari', 'Nyarubuye', 'Rwabukenge', 'Rwanyamuhanga'],
  'Nyarubuye': ['Nyarubuye', 'Rwabukenge', 'Rwanyamuhanga'],
  'Rwabukenge': ['Rwabukenge', 'Rwanyamuhanga'],
  'Rwanyamuhanga': ['Rwanyamuhanga'],
  
  // Musanze District Sectors
  'Busogo': ['Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga'],
  'Cyuve': ['Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi'],
  'Gacaca': ['Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi'],
  'Gashaki': ['Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza'],
  'Gataraga': ['Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza', 'Muko'],
  'Kimonyi': ['Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze'],
  'Kinigi': ['Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi'],
  'Muhoza': ['Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange'],
  'Muko': ['Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera'],
  'Musanze': ['Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza'],
  'Nkotsi': ['Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro'],
  'Nyange': ['Nyange', 'Remera', 'Rwaza', 'Shingiro'],
  'Remera': ['Remera', 'Rwaza', 'Shingiro'],
  'Rwaza': ['Rwaza', 'Shingiro'],
  'Shingiro': ['Shingiro'],
  
  // Ngoma District Sectors
  'Gashanda': ['Gashanda', 'Jarama', 'Karembo', 'Kazo', 'Kibungo'],
  'Jarama': ['Jarama', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera'],
  'Karembo': ['Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama'],
  'Kazo': ['Kazo', 'Kibungo', 'Mugesera', 'Murama', 'Mutenderi'],
  'Kibungo': ['Kibungo', 'Mugesera', 'Murama', 'Mutenderi', 'Remera'],
  'Mugesera': ['Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira'],
  'Murama': ['Murama', 'Mutenderi', 'Remera', 'Rukira', 'Rukumberi'],
  'Mutenderi': ['Mutenderi', 'Remera', 'Rukira', 'Rukumberi', 'Rurenge'],
  'Remera': ['Remera', 'Rukira', 'Rukumberi', 'Rurenge', 'Sake'],
  'Rukira': ['Rukira', 'Rukumberi', 'Rurenge', 'Sake', 'Zaza'],
  'Rukumberi': ['Rukumberi', 'Rurenge', 'Sake', 'Zaza'],
  'Rurenge': ['Rurenge', 'Sake', 'Zaza'],
  'Sake': ['Sake', 'Zaza'],
  'Zaza': ['Zaza'],
  
  // Ngororero District Sectors
  'Bwira': ['Bwira', 'Gatumba', 'Hindiro', 'Kabaya', 'Kageyo'],
  'Gatumba': ['Gatumba', 'Hindiro', 'Kabaya', 'Kageyo', 'Kavumu'],
  'Hindiro': ['Hindiro', 'Kabaya', 'Kageyo', 'Kavumu', 'Matyazo'],
  'Kabaya': ['Kabaya', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda'],
  'Kageyo': ['Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo'],
  'Kavumu': ['Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro'],
  'Matyazo': ['Matyazo', 'Muhanda', 'Muhororo', 'Ndaro', 'Ngororero'],
  'Muhanda': ['Muhanda', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange'],
  'Muhororo': ['Muhororo', 'Ndaro', 'Ngororero', 'Nyange', 'Sovu'],
  'Ndaro': ['Ndaro', 'Ngororero', 'Nyange', 'Sovu'],
  'Ngororero': ['Ngororero', 'Nyange', 'Sovu'],
  'Nyange': ['Nyange', 'Sovu'],
  'Sovu': ['Sovu'],
  
  // Nyabihu District Sectors
  'Bigogwe': ['Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago'],
  'Jenda': ['Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo'],
  'Jomba': ['Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira'],
  'Kabatwa': ['Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa'],
  'Karago': ['Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura'],
  'Kintobo': ['Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rugera'],
  'Mukamira': ['Mukamira', 'Muringa', 'Rambura', 'Rugera', 'Rurembo'],
  'Muringa': ['Muringa', 'Rambura', 'Rugera', 'Rurembo', 'Shyira'],
  'Rambura': ['Rambura', 'Rugera', 'Rurembo', 'Shyira'],
  'Rugera': ['Rugera', 'Rurembo', 'Shyira'],
  'Rurembo': ['Rurembo', 'Shyira'],
  'Shyira': ['Shyira'],
  
  // Nyagatare District Sectors
  'Gatunda': ['Gatunda', 'Kiyombe', 'Karama', 'Musheli', 'Nyagatare'],
  'Kiyombe': ['Kiyombe', 'Karama', 'Musheli', 'Nyagatare', 'Rukomo'],
  'Karama': ['Karama', 'Musheli', 'Nyagatare', 'Rukomo', 'Rwempasha'],
  'Musheli': ['Musheli', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Rwimiyaga'],
  'Nyagatare': ['Nyagatare', 'Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe'],
  'Rukomo': ['Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe'],
  'Rwempasha': ['Rwempasha', 'Rwimiyaga', 'Tabagwe'],
  'Rwimiyaga': ['Rwimiyaga', 'Tabagwe'],
  'Tabagwe': ['Tabagwe'],
  
  // Nyamagabe District Sectors
  'Buruhukiro': ['Buruhukiro', 'Cyanika', 'Gasaka', 'Gatare', 'Kaduha'],
  'Cyanika': ['Cyanika', 'Gasaka', 'Gatare', 'Kaduha', 'Kamegeli'],
  'Gasaka': ['Gasaka', 'Gatare', 'Kaduha', 'Kamegeli', 'Kibirizi'],
  'Gatare': ['Gatare', 'Kaduha', 'Kamegeli', 'Kibirizi', 'Kibumbwe'],
  'Kaduha': ['Kaduha', 'Kamegeli', 'Kibirizi', 'Kibumbwe', 'Kitabi'],
  'Kamegeli': ['Kamegeli', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi'],
  'Kibirizi': ['Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mugano'],
  'Kibumbwe': ['Kibumbwe', 'Kitabi', 'Mbazi', 'Mugano', 'Musange'],
  'Kitabi': ['Kitabi', 'Mbazi', 'Mugano', 'Musange', 'Musebeya'],
  'Mbazi': ['Mbazi', 'Mugano', 'Musange', 'Musebeya', 'Mushubi'],
  'Mugano': ['Mugano', 'Musange', 'Musebeya', 'Mushubi', 'Nkomane'],
  'Musange': ['Musange', 'Musebeya', 'Mushubi', 'Nkomane', 'Tare'],
  'Musebeya': ['Musebeya', 'Mushubi', 'Nkomane', 'Tare', 'Uwinkingi'],
  'Mushubi': ['Mushubi', 'Nkomane', 'Tare', 'Uwinkingi'],
  'Nkomane': ['Nkomane', 'Tare', 'Uwinkingi'],
  'Tare': ['Tare', 'Uwinkingi'],
  'Uwinkingi': ['Uwinkingi'],
  
  // Nyamasheke District Sectors
  'Bushekeri': ['Bushekeri', 'Bushenge', 'Cyato', 'Gihombo', 'Kagano'],
  'Bushenge': ['Bushenge', 'Cyato', 'Gihombo', 'Kagano', 'Kanjongo'],
  'Cyato': ['Cyato', 'Gihombo', 'Kagano', 'Kanjongo', 'Karambi'],
  'Gihombo': ['Gihombo', 'Kagano', 'Kanjongo', 'Karambi', 'Karengera'],
  'Kagano': ['Kagano', 'Kanjongo', 'Karambi', 'Karengera', 'Kirimbi'],
  'Kanjongo': ['Kanjongo', 'Karambi', 'Karengera', 'Kirimbi', 'Macuba'],
  'Karambi': ['Karambi', 'Karengera', 'Kirimbi', 'Macuba', 'Mahembe'],
  'Karengera': ['Karengera', 'Kirimbi', 'Macuba', 'Mahembe', 'Nyabitekeri'],
  'Kirimbi': ['Kirimbi', 'Macuba', 'Mahembe', 'Nyabitekeri', 'Rangiro'],
  'Macuba': ['Macuba', 'Mahembe', 'Nyabitekeri', 'Rangiro', 'Ruharambuga'],
  'Mahembe': ['Mahembe', 'Nyabitekeri', 'Rangiro', 'Ruharambuga', 'Shangi'],
  'Nyabitekeri': ['Nyabitekeri', 'Rangiro', 'Ruharambuga', 'Shangi'],
  'Rangiro': ['Rangiro', 'Ruharambuga', 'Shangi'],
  'Ruharambuga': ['Ruharambuga', 'Shangi'],
  'Shangi': ['Shangi'],
  
  // Nyanza District Sectors
  'Busasamana': ['Busasamana', 'Busoro', 'Cyabakamyi', 'Kibilizi', 'Kigoma'],
  'Busoro': ['Busoro', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo'],
  'Cyabakamyi': ['Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira'],
  'Kibilizi': ['Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Ntyazo'],
  'Kigoma': ['Kigoma', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi'],
  'Mukingo': ['Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma'],
  'Muyira': ['Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma'],
  'Ntyazo': ['Ntyazo', 'Nyagisozi', 'Rwabicuma'],
  'Nyagisozi': ['Nyagisozi', 'Rwabicuma'],
  'Rwabicuma': ['Rwabicuma'],
  
  // Nyaruguru District Sectors
  'Busanze': ['Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Mata'],
  'Cyahinda': ['Cyahinda', 'Kibeho', 'Kivu', 'Mata', 'Muganza'],
  'Kibeho': ['Kibeho', 'Kivu', 'Mata', 'Muganza', 'Munini'],
  'Kivu': ['Kivu', 'Mata', 'Muganza', 'Munini', 'Ngera'],
  'Mata': ['Mata', 'Muganza', 'Munini', 'Ngera', 'Ngoma'],
  'Muganza': ['Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata'],
  'Munini': ['Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi'],
  'Ngera': ['Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Ruheru'],
  'Ngoma': ['Ngoma', 'Nyabimata', 'Nyagisozi', 'Ruheru', 'Ruramba'],
  'Nyabimata': ['Nyabimata', 'Nyagisozi', 'Ruheru', 'Ruramba', 'Rusenge'],
  'Nyagisozi': ['Nyagisozi', 'Ruheru', 'Ruramba', 'Rusenge'],
  'Ruheru': ['Ruheru', 'Ruramba', 'Rusenge'],
  'Ruramba': ['Ruramba', 'Rusenge'],
  'Rusenge': ['Rusenge'],
  
  // Rubavu District Sectors
  'Bugeshi': ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama'],
  'Busasamana': ['Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze'],
  'Cyanzarwe': ['Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze', 'Mudende'],
  'Gisenyi': ['Gisenyi', 'Kanama', 'Kanzenze', 'Mudende', 'Nyakiriba'],
  'Kanama': ['Kanama', 'Kanzenze', 'Mudende', 'Nyakiriba', 'Nyamyumba'],
  'Kanzenze': ['Kanzenze', 'Mudende', 'Nyakiriba', 'Nyamyumba', 'Nyundo'],
  'Mudende': ['Mudende', 'Nyakiriba', 'Nyamyumba', 'Nyundo', 'Rubavu'],
  'Nyakiriba': ['Nyakiriba', 'Nyamyumba', 'Nyundo', 'Rubavu', 'Rugerero'],
  'Nyamyumba': ['Nyamyumba', 'Nyundo', 'Rubavu', 'Rugerero'],
  'Nyundo': ['Nyundo', 'Rubavu', 'Rugerero'],
  'Rubavu': ['Rubavu', 'Rugerero'],
  'Rugerero': ['Rugerero'],
  
  // Ruhango District Sectors
  'Bweramana': ['Bweramana', 'Byimana', 'Kabagali', 'Kinazi', 'Kinihira'],
  'Byimana': ['Byimana', 'Kabagali', 'Kinazi', 'Kinihira', 'Mbuye'],
  'Kabagali': ['Kabagali', 'Kinazi', 'Kinihira', 'Mbuye', 'Mukingo'],
  'Kinazi': ['Kinazi', 'Kinihira', 'Mbuye', 'Mukingo', 'Muyira'],
  'Kinihira': ['Kinihira', 'Mbuye', 'Mukingo', 'Muyira', 'Ntongwe'],
  'Mbuye': ['Mbuye', 'Mukingo', 'Muyira', 'Ntongwe', 'Ruhango'],
  'Mukingo': ['Mukingo', 'Muyira', 'Ntongwe', 'Ruhango', 'Rusatira'],
  'Muyira': ['Muyira', 'Ntongwe', 'Ruhango', 'Rusatira', 'Rweru'],
  'Ntongwe': ['Ntongwe', 'Ruhango', 'Rusatira', 'Rweru', 'Shyira'],
  'Ruhango': ['Ruhango', 'Rusatira', 'Rweru', 'Shyira'],
  'Rusatira': ['Rusatira', 'Rweru', 'Shyira'],
  'Rweru': ['Rweru', 'Shyira'],
  'Shyira': ['Shyira'],
  
  // Rulindo District Sectors
  'Base': ['Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi'],
  'Burega': ['Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo'],
  'Bushoki': ['Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira'],
  'Buyoga': ['Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira', 'Kisaro'],
  'Cyinzuzi': ['Cyinzuzi', 'Cyungo', 'Kinihira', 'Kisaro', 'Masoro'],
  'Cyungo': ['Cyungo', 'Kinihira', 'Kisaro', 'Masoro', 'Mbogo'],
  'Kinihira': ['Kinihira', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi'],
  'Kisaro': ['Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma'],
  'Masoro': ['Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Nkoto'],
  'Mbogo': ['Mbogo', 'Murambi', 'Ngoma', 'Nkoto', 'Rusiga'],
  'Murambi': ['Murambi', 'Ngoma', 'Nkoto', 'Rusiga', 'Rutare'],
  'Ngoma': ['Ngoma', 'Nkoto', 'Rusiga', 'Rutare'],
  'Nkoto': ['Nkoto', 'Rusiga', 'Rutare'],
  'Rusiga': ['Rusiga', 'Rutare'],
  'Rutare': ['Rutare'],
  
  // Rusizi District Sectors
  'Bugarama': ['Bugarama', 'Butare', 'Bweyeye', 'Gashonga', 'Giheke'],
  'Butare': ['Butare', 'Bweyeye', 'Gashonga', 'Giheke', 'Gihundwe'],
  'Bweyeye': ['Bweyeye', 'Gashonga', 'Giheke', 'Gihundwe', 'Gikundamvura'],
  'Gashonga': ['Gashonga', 'Giheke', 'Gihundwe', 'Gikundamvura', 'Gitambi'],
  'Giheke': ['Giheke', 'Gihundwe', 'Gikundamvura', 'Gitambi', 'Kamembe'],
  'Gihundwe': ['Gihundwe', 'Gikundamvura', 'Gitambi', 'Kamembe', 'Muganza'],
  'Gikundamvura': ['Gikundamvura', 'Gitambi', 'Kamembe', 'Muganza', 'Mururu'],
  'Gitambi': ['Gitambi', 'Kamembe', 'Muganza', 'Mururu', 'Nkanka'],
  'Kamembe': ['Kamembe', 'Muganza', 'Mururu', 'Nkanka', 'Nkombo'],
  'Muganza': ['Muganza', 'Mururu', 'Nkanka', 'Nkombo', 'Nkungu'],
  'Mururu': ['Mururu', 'Nkanka', 'Nkombo', 'Nkungu', 'Nyakabuye'],
  'Nkanka': ['Nkanka', 'Nkombo', 'Nkungu', 'Nyakabuye', 'Nyakarenzo'],
  'Nkombo': ['Nkombo', 'Nkungu', 'Nyakabuye', 'Nyakarenzo', 'Nzahaha'],
  'Nkungu': ['Nkungu', 'Nyakabuye', 'Nyakarenzo', 'Nzahaha', 'Rwimbogo'],
  'Nyakabuye': ['Nyakabuye', 'Nyakarenzo', 'Nzahaha', 'Rwimbogo'],
  'Nyakarenzo': ['Nyakarenzo', 'Nzahaha', 'Rwimbogo'],
  'Nzahaha': ['Nzahaha', 'Rwimbogo'],
  'Rwimbogo': ['Rwimbogo'],
  
  // Rutsiro District Sectors
  'Boneza': ['Boneza', 'Gihango', 'Kigeyo', 'Kivumu', 'Manihira'],
  'Gihango': ['Gihango', 'Kigeyo', 'Kivumu', 'Manihira', 'Mukura'],
  'Kigeyo': ['Kigeyo', 'Kivumu', 'Manihira', 'Mukura', 'Murunda'],
  'Kivumu': ['Kivumu', 'Manihira', 'Mukura', 'Murunda', 'Musasa'],
  'Manihira': ['Manihira', 'Mukura', 'Murunda', 'Musasa', 'Mushonyi'],
  'Mukura': ['Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati'],
  'Murunda': ['Murunda', 'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi'],
  'Musasa': ['Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango'],
  'Mushonyi': ['Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango', 'Rusebeya'],
  'Mushubati': ['Mushubati', 'Nyabirasi', 'Ruhango', 'Rusebeya', 'Rusizi'],
  'Nyabirasi': ['Nyabirasi', 'Ruhango', 'Rusebeya', 'Rusizi'],
  'Ruhango': ['Ruhango', 'Rusebeya', 'Rusizi'],
  'Rusebeya': ['Rusebeya', 'Rusizi'],
  'Rusizi': ['Rusizi'],
  
  // Rwamagana District Sectors
  'Fumbwe': ['Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro'],
  'Gahengeri': ['Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Muhazi'],
  'Gishari': ['Gishari', 'Karenge', 'Kigabiro', 'Muhazi', 'Munyaga'],
  'Karenge': ['Karenge', 'Kigabiro', 'Muhazi', 'Munyaga', 'Munyiginya'],
  'Kigabiro': ['Kigabiro', 'Muhazi', 'Munyaga', 'Munyiginya', 'Musaza'],
  'Muhazi': ['Muhazi', 'Munyaga', 'Munyiginya', 'Musaza', 'Mushonyi'],
  'Munyaga': ['Munyaga', 'Munyiginya', 'Musaza', 'Mushonyi', 'Muyumbu'],
  'Munyiginya': ['Munyiginya', 'Musaza', 'Mushonyi', 'Muyumbu', 'Mwulire'],
  'Musaza': ['Musaza', 'Mushonyi', 'Muyumbu', 'Mwulire', 'Nyakaliro'],
  'Mushonyi': ['Mushonyi', 'Muyumbu', 'Mwulire', 'Nyakaliro', 'Nzige'],
  'Muyumbu': ['Muyumbu', 'Mwulire', 'Nyakaliro', 'Nzige', 'Rubona'],
  'Mwulire': ['Mwulire', 'Nyakaliro', 'Nzige', 'Rubona', 'Rukoma'],
  'Nyakaliro': ['Nyakaliro', 'Nzige', 'Rubona', 'Rukoma', 'Rukura'],
  'Nzige': ['Nzige', 'Rubona', 'Rukoma', 'Rukura', 'Rurenge'],
  'Rubona': ['Rubona', 'Rukoma', 'Rukura', 'Rurenge'],
  'Rukoma': ['Rukoma', 'Rukura', 'Rurenge'],
  'Rukura': ['Rukura', 'Rurenge'],
  'Rurenge': ['Rurenge']
};

// Rwanda cells array (same as Profile.jsx)
const rwandaCells = [
  'Bumbogo',
  'Gatsata',
  'Gikomero',
  'Gisozi',
  'Jabana',
  'Jali',
  'Kacyiru',
  'Kimihurura',
  'Kimironko',
  'Kinyinya',
  'Ndera',
  'Nduba',
  'Remera',
  'Rusororo',
  'Rutunga',
  'Gahanga',
  'Gatenga',
  'Gikondo',
  'Kagarama',
  'Kanombe',
  'Kicukiro',
  'Kigarama',
  'Masaka',
  'Niboye',
  'Nyarugunga'
];

// Waste types that recycling centers can accept
const wasteTypes = [
  { id: 'plastic_bottles', label: 'Plastic Bottles', icon: '🥤' },
  { id: 'plastic_bags', label: 'Plastic Bags', icon: '🛍️' },
  { id: 'paper', label: 'Paper & Cardboard', icon: '📄' },
  { id: 'glass', label: 'Glass', icon: '🍾' },
  { id: 'aluminum', label: 'Aluminum Cans', icon: '🥫' },
  { id: 'steel', label: 'Steel/Metal', icon: '🔧' },
  { id: 'electronics', label: 'Electronics (E-waste)', icon: '💻' },
  { id: 'batteries', label: 'Batteries', icon: '🔋' },
  { id: 'textiles', label: 'Textiles & Clothing', icon: '👕' },
  { id: 'organic', label: 'Organic Waste', icon: '🍃' },
  { id: 'construction', label: 'Construction Materials', icon: '🧱' },
  { id: 'automotive', label: 'Automotive Parts', icon: '🚗' },
  { id: 'medical', label: 'Medical Waste', icon: '🏥' },
  { id: 'hazardous', label: 'Hazardous Materials', icon: '⚠️' },
  { id: 'other', label: 'Other Materials', icon: '📦' }
];

export default function PersonalInfo() {
  console.log('PersonalInfo: Component mounted');
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    last_name: '',
    gender: '',
    phone_number: '',
    ubudehe_category: '',
    company_name: '',
    company_website: '',
    house_number: '',
    district: '',
    sector: '',
    cell: '',
    street: '',
    waste_types: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [pricingData, setPricingData] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get user credentials from location state (passed from signup)
  const userCredentials = location.state?.userCredentials;

  // Redirect to signup if no credentials are provided
  useEffect(() => {
    console.log('PersonalInfo: userCredentials:', userCredentials);
    console.log('PersonalInfo: location.state:', location.state);
    
    if (!userCredentials) {
      console.log('PersonalInfo: No credentials found, redirecting to signup');
      navigate('/signup');
    }
  }, [userCredentials, navigate, location.state]);

  // Check if user is a business entity (waste collector or recycling center)
  const isBusinessEntity = userCredentials?.role === 'waste_collector' || userCredentials?.role === 'recycling_center';

  // Fetch pricing data for ubudehe categories
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setPricingLoading(true);
        console.log('PersonalInfo: Starting to fetch pricing data...');
        
        // Always try to fetch from API first (pricing endpoints are public)
        console.log('PersonalInfo: Fetching from API...');
        const data = await pricingApi.getAllPricing();
        console.log('PersonalInfo: Pricing data fetched from API:', data);
        console.log('PersonalInfo: First item description:', data[0]?.description);
        setPricingData(data);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        // Set default pricing if API fails
        const fallbackPricing = [
          { ubudehe_category: 'A', amount: 1000, description: 'Category A - Lowest income bracket' },
          { ubudehe_category: 'B', amount: 1500, description: 'Category B - Low income bracket' },
          { ubudehe_category: 'C', amount: 2000, description: 'Category C - Medium income bracket' },
          { ubudehe_category: 'D', amount: 4000, description: 'Category D - High income bracket' }
        ];
        console.log('PersonalInfo: Setting fallback pricing:', fallbackPricing);
        setPricingData(fallbackPricing);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  // Get sectors for selected district
  const getSectorsForDistrict = (district) => {
    return districtSectorMapping[district] || [];
  };

  // Get cells for selected sector
  const getCellsForSector = (sector) => {
    // First try the exact sector name
    if (sectorCellMapping[sector]) {
      return sectorCellMapping[sector];
    }
    
    // If not found, try with district prefix
    if (form.district) {
      const districtPrefixedSector = `${form.district}_${sector}`;
      if (sectorCellMapping[districtPrefixedSector]) {
        return sectorCellMapping[districtPrefixedSector];
      }
    }
    
    // If still not found, search for the sector in any district
    for (const [key, cells] of Object.entries(sectorCellMapping)) {
      if (key === sector || key.endsWith(`_${sector}`)) {
        return cells;
      }
    }
    
    return [];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isBusinessEntity) {
      // For business entities, validate company name instead of personal fields
      if (!form.company_name?.trim()) {
        newErrors.company_name = t('errors.required');
      }
      
      // For recycling centers, validate waste types
      if (userCredentials?.role === 'recycling_center' && (!form.waste_types || form.waste_types.length === 0)) {
        newErrors.waste_types = 'Please select at least one type of waste you accept';
      }
    } else {
      // For regular users, validate personal fields
      if (!form.name?.trim()) {
        newErrors.name = t('errors.required');
      }
      if (!form.last_name?.trim()) {
        newErrors.last_name = t('errors.required');
      }
      if (!form.gender) {
        newErrors.gender = t('errors.required');
      }
      if (!form.ubudehe_category) {
        newErrors.ubudehe_category = t('errors.required');
      }
      // House number validation only for regular users
      if (!form.house_number?.trim()) {
        newErrors.house_number = t('errors.required');
      }
    }
    
    // Common validations for all users
    if (!form.phone_number?.trim()) {
      newErrors.phone_number = t('errors.required');
    } else if (!/^(\+250|0)?7[2389][0-9]{7}$/.test(form.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = 'Please enter a valid Rwandan phone number';
    }
    if (!form.district) {
      newErrors.district = t('errors.required');
    }
    if (!form.sector) {
      newErrors.sector = t('errors.required');
    }
    if (!form.cell) {
      newErrors.cell = t('errors.required');
    }
    if (!form.street?.trim()) {
      newErrors.street = t('errors.required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Reset dependent fields when district changes
    if (name === 'district') {
      setForm(prev => ({ 
        ...prev, 
        [name]: value,
        sector: '', // Reset sector when district changes
        cell: ''    // Reset cell when district changes
      }));
    }
    
    // Reset cell when sector changes
    if (name === 'sector') {
      setForm(prev => ({ 
        ...prev, 
        [name]: value,
        cell: '' // Reset cell when sector changes
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleWasteTypeToggle = (wasteTypeId) => {
    setForm(prev => {
      const currentTypes = prev.waste_types || [];
      const newTypes = currentTypes.includes(wasteTypeId)
        ? currentTypes.filter(id => id !== wasteTypeId)
        : [...currentTypes, wasteTypeId];
      
      return { ...prev, waste_types: newTypes };
    });
    
    if (errors.waste_types) {
      setErrors(prev => ({ ...prev, waste_types: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!userCredentials) {
      setServerError('User credentials not found. Please try signing up again.');
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      // Login the user to get the token
      const loginResponse = await API.post('/auth/login', {
        email: userCredentials.email,
        password: userCredentials.password
      });

      // Store the token
      localStorage.setItem('token', loginResponse.data.token);

      // Prepare profile data based on user type
      const profileData = isBusinessEntity ? {
        name: form.company_name, // Use company name as the name field
        phone_number: form.phone_number,
        district: form.district,
        sector: form.sector,
        cell: form.cell,
        street: form.street,
        company_website: form.company_website
      } : {
        name: form.name,
        last_name: form.last_name,
        gender: form.gender,
        phone_number: form.phone_number,
        ubudehe_category: form.ubudehe_category,
        house_number: form.house_number,
        district: form.district,
        sector: form.sector,
        cell: form.cell,
        street: form.street
      };

      console.log('Form state:', form);
      console.log('Profile data being sent:', profileData);
      console.log('Is business entity:', isBusinessEntity);

      // Update user profile with personal information
      const profileDataToSend = { ...profileData };
      
      // Add waste types for recycling centers to user profile
      if (userCredentials?.role === 'recycling_center' && form.waste_types && form.waste_types.length > 0) {
        profileDataToSend.waste_types = form.waste_types;
      }
      
      const profileResponse = await API.put('/users/profile/me', profileDataToSend, {
        headers: {
          Authorization: `Bearer ${loginResponse.data.token}`
        }
      });

      console.log('Profile update response:', profileResponse.data);

      // If user is a waste collector or recycling center, update the company record with additional info
      if (isBusinessEntity) {
        try {
          const companyUpdateData = {
            email: userCredentials.email,
            phone: form.phone_number,
            district: form.district,
            sector: form.sector,
            cell: form.cell,
            village: form.street, // Using street as village
            street: form.street,
            amount_per_month: 0, // Default amount, can be updated later
            website: form.company_website
          };

          // Add waste types for recycling centers
          if (userCredentials?.role === 'recycling_center' && form.waste_types && form.waste_types.length > 0) {
            companyUpdateData.waste_types = form.waste_types;
          }

          await API.put('/companies/update-by-email', companyUpdateData, {
            headers: {
              Authorization: `Bearer ${loginResponse.data.token}`
            }
          });
        } catch (companyError) {
          console.error('Error updating company info:', companyError);
          // Don't fail the registration if company update fails
        }
      }

      // Login the user through AuthContext
      await login(userCredentials.email, userCredentials.password);

      // Navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Registration/Login error:', err);
      setServerError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If no user credentials, redirect to signup
  if (!userCredentials) {
    navigate('/signup');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-green-200 p-4">
      <div className="w-full max-w-6xl bg-white/0 rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Illustration and Company Info */}
        <div className="lg:w-1/2 flex flex-col justify-between items-center bg-gradient-to-br from-green-200 via-blue-100 to-green-100 p-6 sm:p-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" fill="#22c55e" />
                    <rect x="8" y="8" width="8" height="8" rx="2" fill="#fff" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-gray-800">Ecotunga.</div>
                  <div className="text-xs text-gray-500">Kigali, Rwanda</div>
                </div>
              </div>
              <LanguageSelector />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img src={logo} alt="Illustration" className="w-48 h-48 sm:w-72 sm:h-72 object-contain" />
          </div>
        </div>
        
        {/* Right Side: Personal Information Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white/80 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{t('auth.completeProfile')}</h2>
              <p className="text-gray-500 text-sm">{t('auth.completeProfileSubtitle')}</p>
            </div>
            
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{serverError}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal/Business Information */}
              <div className="space-y-4">
                
                <div className="space-y-4">
                  {isBusinessEntity ? (
                    // Business entity fields
                    <>
                      <div>
                        <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Company Name *
                        </label>
                        <input
                          type="text"
                          id="company_name"
                          name="company_name"
                          value={form.company_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your company name"
                          className={`w-full px-4 py-3 border ${errors.company_name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        />
                        {errors.company_name && <p className="mt-1 text-xs text-red-600">{errors.company_name}</p>}
                      </div>
                      
                      {/* Company Website Field - Only for recycling centers */}
                      {userCredentials?.role === 'recycling_center' && (
                        <div>
                          <label htmlFor="company_website" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                            </svg>
                            Company Website
                          </label>
                          <input
                            type="url"
                            id="company_website"
                            name="company_website"
                            value={form.company_website}
                            onChange={handleChange}
                            placeholder="https://www.yourcompany.com"
                            className={`w-full px-4 py-3 border ${errors.company_website ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                          />
                          {errors.company_website && <p className="mt-1 text-xs text-red-600">{errors.company_website}</p>}
                          <p className="mt-1 text-xs text-gray-500">
                            Optional: Add your company website URL
                          </p>
                        </div>
                      )}
                      
                      {/* Waste Types Selection - Only for recycling centers */}
                      {userCredentials?.role === 'recycling_center' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Types of Waste You Accept *
                          </label>
                          <div className=" max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                            {wasteTypes.map((wasteType) => (
                              <label
                                key={wasteType.id}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                                  form.waste_types?.includes(wasteType.id)
                                    ? 'bg-green-100 border-green-300 border'
                                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={form.waste_types?.includes(wasteType.id) || false}
                                  onChange={() => handleWasteTypeToggle(wasteType.id)}
                                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="text-lg">{wasteType.icon}</span>
                                <span className="text-sm font-medium text-gray-700">{wasteType.label}</span>
                              </label>
                            ))}
                          </div>
                          {errors.waste_types && <p className="mt-1 text-xs text-red-600">{errors.waste_types}</p>}
                          <p className="mt-2 text-xs text-gray-500">
                            Select all the types of waste materials your recycling center accepts
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    // Regular user fields
                    <>
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {t('profile.firstName')} *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder={t('profile.firstNamePlaceholder')}
                          className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.lastName')} *
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          required
                          placeholder={t('profile.lastNamePlaceholder')}
                          className={`w-full px-4 py-3 border ${errors.last_name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        />
                        {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.gender')} *
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          required
                          className={`w-full px-4 py-3 border ${errors.gender ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        >
                          <option value="">{t('profile.selectGender')}</option>
                          <option value="Male">{t('profile.male')}</option>
                          <option value="Female">{t('profile.female')}</option>
                          <option value="Other">{t('profile.other')}</option>
                        </select>
                        {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="ubudehe_category" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('profile.ubudeheCategory')} *
                        </label>
                        <select
                          id="ubudehe_category"
                          name="ubudehe_category"
                          value={form.ubudehe_category}
                          onChange={handleChange}
                          required
                          className={`w-full px-4 py-3 border ${errors.ubudehe_category ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        >
                          <option value="">Select</option>
                          {pricingData.map((pricing) => (
                            <option key={pricing.ubudehe_category} value={pricing.ubudehe_category}>
                              {pricing.description}
                            </option>
                          ))}
                        </select>
                        {errors.ubudehe_category && <p className="mt-1 text-xs text-red-600">{errors.ubudehe_category}</p>}
                      </div>
                      
                      {/* House Number Field - Only for regular users */}
                      <div>
                        <label htmlFor="house_number" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          House Number *
                        </label>
                        <input
                          type="text"
                          id="house_number"
                          name="house_number"
                          value={form.house_number}
                          onChange={handleChange}
                          required
                          placeholder="Enter your house number"
                          className={`w-full px-4 py-3 border ${errors.house_number ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                        />
                        {errors.house_number && <p className="mt-1 text-xs text-red-600">{errors.house_number}</p>}
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('profile.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      required
                      placeholder={t('profile.phoneNumberPlaceholder')}
                      className={`w-full px-4 py-3 border ${errors.phone_number ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                    />
                    {errors.phone_number && <p className="mt-1 text-xs text-red-600">{errors.phone_number}</p>}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.district')} *
                    </label>
                    <select
                      id="district"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border ${errors.district ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                    >
                      <option value="">Select</option>
                      {rwandaDistricts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="sector" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.sector')} *
                    </label>
                    <select
                      id="sector"
                      name="sector"
                      value={form.sector}
                      onChange={handleChange}
                      required
                      disabled={!form.district}
                      className={`w-full px-4 py-3 border ${errors.sector ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${!form.district ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">{form.district ? 'Select Sector' : 'Select District First'}</option>
                      {form.district && getSectorsForDistrict(form.district).map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                    {errors.sector && <p className="mt-1 text-xs text-red-600">{errors.sector}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="cell" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.cell')} *
                    </label>
                    <select
                      id="cell"
                      name="cell"
                      value={form.cell}
                      onChange={handleChange}
                      required
                      disabled={!form.sector}
                      className={`w-full px-4 py-3 border ${errors.cell ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${!form.sector ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">{form.sector ? 'Select Cell' : 'Select Sector First'}</option>
                      {form.sector && getCellsForSector(form.sector).map((cell) => (
                        <option key={cell} value={cell}>{cell}</option>
                      ))}
                    </select>
                    {errors.cell && <p className="mt-1 text-xs text-red-600">{errors.cell}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('profile.street')} *
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      required
                      placeholder={t('profile.streetPlaceholder')}
                      className={`w-full px-4 py-3 border ${errors.street ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white`}
                    />
                    {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-base sm:text-lg shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span>{t('auth.completingRegistration')}</span>
              ) : (
                <span>{t('auth.completeRegistration')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 