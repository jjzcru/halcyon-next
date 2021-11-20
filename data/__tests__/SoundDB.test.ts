import { getSounds, getSound, getSoundByType } from '../db/SoundDB'

test.skip('Should get the list of all the sounds', async () => {
    const sounds = await getSounds();
    expect(typeof sounds).toBe('object');
    expect(sounds.length).toBeGreaterThan(0);
});

test.skip('Should get the list of all the sounds that are type "sound"', async () => {
    const type = 'sound';
    const sounds = await getSoundByType(type);
    expect(typeof sounds).toBe('object');
    expect(sounds.length).toBeGreaterThan(0);
    for(const sound of sounds) {
        expect(sound.type).toBe(type);
    }
});

test.skip('Should get a sound by id', async () => {
    const id = '701843824305710865';
    const sound = await getSound(id);
    expect(sound).toBeDefined()
    expect(sound.id).toBe(id);
});