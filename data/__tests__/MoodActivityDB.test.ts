import { getMoodActivities} from '../db/MoodActivityDB'

test('Should get mood activities', async () => {
    const activities = await getMoodActivities();
    expect(typeof activities).toBe('object');
    expect(activities.length).toBeGreaterThan(1);
    for(const activity of activities) {
        expect(activity).toBeDefined();
        expect(activity.id).toBeDefined();
        expect(activity.inputEmotion).toBeDefined();
        expect(activity.outputEmotion).toBeDefined();
    }
});

