-- 添加 skillLevel 字段到 users 表
ALTER TABLE users ADD COLUMN skill_level VARCHAR(20) DEFAULT 'beginner';

-- 为现有用户设置默认值
UPDATE users SET skill_level = 'beginner' WHERE skill_level IS NULL;

-- 添加约束确保只能是有效值
ALTER TABLE users ADD CONSTRAINT users_skill_level_check 
CHECK (skill_level IN ('beginner', 'intermediate', 'advanced'));