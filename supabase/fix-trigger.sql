-- Fix: Recreate trigger function with RLS bypass
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.brand_settings (user_id, key, value) VALUES
    (NEW.id, 'name', 'Cirque'),
    (NEW.id, 'voice', 'Bold, adventurous, premium. We speak to those who push boundaries on the mountain.'),
    (NEW.id, 'audience', 'Skiers and snowboarders aged 18-35 who value performance gear and mountain culture.'),
    (NEW.id, 'content_pillars', 'Mountain adventures, product innovation, athlete stories, behind-the-scenes, user-generated content'),
    (NEW.id, 'hashtags', '#cirqueoutside #cirquegoggles #sendit #mountainlife #skilife #snowboarding #powderday');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
