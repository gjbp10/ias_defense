import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://itxjqcnvxlgzeqkivhhc.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vD7hDjeuohyysFweHnJPPQ_xId2pJ4F';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STATION_MAP = {
  'Sto Nino': 'Sto. Niño Station',
  'Sto. Nino': 'Sto. Niño Station',
  'Nangka': 'Nangka Station',
  'Rodriguez': 'Rodriguez Station',
  'Burgos': 'San Jose Station',
  'Montalban': 'San Jose Station',
  'Tumana Bridge': 'Tumana Station'
};

async function fetchPagasaDirectly() {
  try {
    console.log('[PAGASA Scraper] Scraping http://pasig-marikina-tullahanftws.pagasa.dost.gov.ph/water/map.do...');
    const url = 'http://pasig-marikina-tullahanftws.pagasa.dost.gov.ph/water/map.do';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    const scrapedStations = [];

    // PAGASA table structure:
    // Col 0: Station Name
    // Col 1: Current [EL.m]
    // Col 2: Alert [EL.m] (1st Alarm)
    // Col 3: Alarm [EL.m] (2nd Alarm)
    // Col 4: Critical [EL.m] (3rd Alarm)
    $('table tr').each((_, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 5) {
        const rawName = $(cols[0]).text().trim();
        const currentStr = $(cols[1]).text().trim().replace(/\(\*\)/g, '');
        const alertStr = $(cols[2]).text().trim();
        const alarmStr = $(cols[3]).text().trim();
        const criticalStr = $(cols[4]).text().trim();

        const currentLevel = parseFloat(currentStr);
        const alertThreshold = parseFloat(alertStr);
        const alarmThreshold = parseFloat(alarmStr);
        const criticalThreshold = parseFloat(criticalStr);

        for (const [key, mappedName] of Object.entries(STATION_MAP)) {
          if (rawName.includes(key) && !isNaN(currentLevel)) {
            
            // Calculate Alarm status directly using PAGASA's own thresholds
            let status = 'Normal';
            if (!isNaN(criticalThreshold) && currentLevel >= criticalThreshold) {
              status = '3rd Alarm';
            } else if (!isNaN(alarmThreshold) && currentLevel >= alarmThreshold) {
              status = '2nd Alarm';
            } else if (!isNaN(alertThreshold) && currentLevel >= alertThreshold) {
              status = '1st Alarm';
            }

            scrapedStations.push({
              station_name: mappedName,
              level: currentLevel,
              status: status,
              alert_threshold: alertThreshold || null,
              alarm_threshold: alarmThreshold || null,
              critical_threshold: criticalThreshold || null,
              updated_at: new Date().toISOString()
            });
            break;
          }
        }
      }
    });

    return scrapedStations;
  } catch (error) {
    console.error('[PAGASA Scraper] Scrape error:', error.message);
    return [];
  }
}

async function syncToSupabase() {
  const stations = await fetchPagasaDirectly();
  if (stations.length === 0) return;

  console.log(`[PAGASA Scraper] Updating ${stations.length} stations in Supabase...`);
  for (const st of stations) {
    const { error } = await supabase
      .from('monitoring_stations')
      .upsert(
        {
          station_name: st.station_name,
          level: st.level,
          status: st.status,
          updated_at: st.updated_at
        },
        { onConflict: 'station_name' }
      );

    if (error) {
      console.error(`❌ Failed ${st.station_name}:`, error.message);
    } else {
      console.log(`✅ Synced ${st.station_name}: ${st.level}m -> ${st.status}`);
    }
  }
}

// Execute immediately & run every 5 minutes
syncToSupabase();
cron.schedule('*/5 * * * *', () => syncToSupabase());
