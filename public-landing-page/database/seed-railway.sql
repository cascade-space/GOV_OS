-- ============================================================
-- SEED DATA FOR RAILWAY DATABASE
-- Run this in pgAdmin connected to Railway
-- ============================================================

-- Users (admin, mla, superadmin)
INSERT INTO users (id, email, username, password_hash, full_name, role, status, created_at)
VALUES
('63c9c74d-4eab-4b41-aca6-85346c0dfab0', 'admin@civicpath.com', 'admin', '$2b$10$qKNCQZTexbRr1fqygDASsOF.qFijjif7hRJf5IhfuRvbBdKcJ3QiW', 'System Administrator', 'admin', 'active', '2026-03-20T06:46:34.364Z'),
('0f5f3549-4960-4ded-a616-99a0b67cc1f6', 'mla@civicpath.com', 'mla', '$2b$10$ptjImIgVaOaY0TPUE1P8O.jNdL8MxcxbNDUYZ82JpdI4kvAZ74yUC', 'MLA User', 'mla', 'active', '2026-03-20T06:46:34.481Z'),
('aa5538a8-dfe1-476a-bf5c-c6b54915b19b', 'superadmin@civicpath.com', 'superadmin', '$2b$10$XSg3wQ/f2fCJ46UnTNa4luwD/ZcXwUqvKz23hBXgXCYJ7jadmMxT.', 'Super Administrator', 'admin', 'active', '2026-03-20T06:46:34.485Z')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Officers
INSERT INTO officers (id, name, email, department, role, mla_id, status, created_at)
VALUES
(1, 'Test Officer', 'testofficer@civicpath.com', 'Public Works', 'officer', '0f5f3549-4960-4ded-a616-99a0b67cc1f6', 'active', '2026-03-24T07:42:06.550Z'),
(5, 'arun', 'arunpattar13503@gmail.com', 'Urban Development', 'officer', '0f5f3549-4960-4ded-a616-99a0b67cc1f6', 'active', '2026-03-24T13:51:22.573Z'),
(6, 'redd', 'redx13503@gmail.com', 'Rural Development', 'officer', '0f5f3549-4960-4ded-a616-99a0b67cc1f6', 'active', '2026-03-24T14:30:53.845Z'),
(7, 'Mayur', 'mayurmadiwal13@gmail.com', 'Social Welfare', 'officer', '0f5f3549-4960-4ded-a616-99a0b67cc1f6', 'active', '2026-03-24T14:39:58.443Z')
ON CONFLICT (email) DO NOTHING;

-- Complaints
INSERT INTO complaints (id, complaint_number, title, description, category, sub_category, priority, status, citizen_name, citizen_mobile, location_address, latitude, longitude, ward, created_at)
VALUES
('1a3fa8fa-a50e-46c1-b5ff-ce26ac6dbe8f','CMP-2026-00001','light offkkkkkkkkkkkkkkkkkkkkkkkk','ewedxbxhhhhhhhhhhgttttttttttnfccccccccccc nhyfddddddddd','electricity','Power Outage','low','submitted','Mayurr','8458456984','72nd Cross Road, Rajajinagar 5th Block, Bengaluru','12.98359486','77.53701261','Rama Mandira','2026-02-24T18:28:16.348Z'),
('642f828e-1ff4-4894-8090-8e39a78fce46','CMP-2026-00006','car accident','eeeeeeeeeeefffffffffrrrrrrrrrrrrrrrrhhhhhhhhhhhhhhhhh7775555555555555555ttttttt','parks','Broken Benches','medium','submitted','vivek oberoi','8787878787','Sirur Park, Hubli, Karnataka, 580020','15.36492369','75.12217925','Sirur Park','2026-02-26T05:40:14.300Z'),
('abfcc407-f6c4-4535-bad0-f65cb427c32e','CMP-2026-00007','affffffffffffwwwwe','ekjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnncc','drainage','Blocked Drain','high','submitted','mayur','7875965466','Bengaluru Baking Company, Vittal Mallya Road, Karnataka','12.97197326','77.59476618','Ashokanagar','2026-02-26T07:52:50.405Z'),
('222fd6b8-b017-4e4f-ba86-deb462fd4d65','CMP-2026-00008',',zzzzzzzzzzzzzzzzzzzzzzz','xxm  z,xxzzzxxxzxzzx','street_lighting','Light Not Working','high','submitted','appppppppppppppppppppppp','9783515348','Sree Kanteerava Stadium, Rajaram Mohan Roy Road, Karnataka','12.96978708','77.59345817','Sampangirama Nagar','2026-02-26T17:31:03.177Z'),
('faf67e92-3ee6-43bb-8fc3-9e95520bc340','CMP-2026-00009','water waterm;lsm;dmsmd;s;dmsmds;s;lmmmmmmm','sdsmd ,ms d,s,n,snkjhslhiosihhshisihidissodhshohsdosods','drainage','Blocked Drain','high','submitted','mayurrrr devil','9798984646','Kasturba Cross Road, Shanthala Nagar, Karnataka','12.97340726','77.59695715','Ashokanagar','2026-03-05T07:32:27.206Z'),
('1053bb63-5b31-4b1c-9553-0b350625e2fa','CMP-2026-00010','djsknhknsdvkggknfjnbnvkldfnvkldf','ggggggg,,,,,,,,;,l;h''h','roads','Road Cave-in','medium','submitted','mayur anuja','8310459733','Sirur Park, Hubli, Karnataka, 580020','15.36494458','75.12208837','Sirur Park','2026-03-06T05:58:46.214Z'),
('1326621b-f9f3-4d72-8a4b-383d25fdf69f','CMP-2026-00011','namm mbhghkbguu','lmmmmomomjhfjmb,jkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk','drainage','Sewage Leaking','high','submitted','dog','8974454546','AquaSafi Purification System, Unkal Bypass Road, Hubli','15.36134238','75.12264102','Sirur Park','2026-03-08T05:29:16.783Z'),
('4df75ec4-b1b7-427b-8d12-1c066fb0fcd7','CMP-2026-00012','bjkbjbjkbkjbkjbkb','nbononononihbbbbbbbbjjhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh','roads','Pothole','high','submitted','yash gdwwwwww','7866984546','Sirur Park, Hubli, Karnataka, 580020','15.36494458','75.12208837','Sirur Park','2026-03-10T06:16:57.667Z'),
('d158c784-0dd2-48fd-afa5-5609a5926e12','CMP-2026-00013','Masydguusdgbsdu,vdvsd','sdshdshdshdkshkihkhkdhskuhdsudhshduidsh','other','Noise Complaint','high','submitted','pradeep a,sjakanja','8686445454','AquaSafi Purification System, Unkal Bypass Road, Hubli','15.36124711','75.12272739','Sirur Park','2026-03-10T11:05:12.585Z'),
('11564e87-377a-4772-aaa5-918fd7b9a36d','CMP-2026-00002','Test Complaint - Broken Street Light','The street light on Main Street has been broken for 3 days','infrastructure','Street Lights','medium','validated','Test User','9876543210','Main Street, Test Area','12.97160000','77.59460000','Test Ward','2026-02-25T17:33:24.382Z'),
('7721d7ae-e881-4708-b6dd-d45752d16a33','CMP-2026-00003','frrrrrrrrrrrrrrrrrrrrrrrr','reggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg','parks','Broken Benches','high','assigned','vijay r','8789874566','AquaSafi Purification System, Unkal Bypass Road, Hubli','15.36133604','75.12265415','Sirur Park','2026-02-25T17:55:54.330Z'),
('cd55f4cc-01a8-4a22-a1ce-649c7a06d59f','CMP-2026-00004','gthhhhhhhhhhhhhhhhhh','hhhhhtttttttttttttttttttttttttttbbbbbbbbbbbbbbbbbbbbbbbccccccccccccccccccccccccccccccbhhhhhhhhhh','sanitation','Sewage Overflow','high','in_progress','goat dhoni','7777777777','Sirur Park, Hubli, Karnataka, 580020','15.36133798','75.12270237','Sirur Park','2026-02-25T18:12:56.049Z'),
('7d89dc2a-be91-4e9f-9cf8-5281df6e8a2a','CMP-2026-00005','dccccccccccccccccccd','fffffffffffffffffffffffffffffffffffffffffffffffffffff','health','Stray Animals','low','resolved','abhi','7777777777','Kasturba Road, Sampangirama Nagar, Karnataka','12.97364438','77.59493789','Sampangirama Nagar','2026-02-25T18:24:16.820Z'),
('1ab11fd2-fb36-476f-9497-4e3b33f3885d','CMP-2026-00014','Garbagee all over','all the Garbage is split over the foothpath and leakage of drainage','drainage','Sewage Leaking','high','submitted','Mayur Madiwal','9741385670','Sirur Park, Hubli, Karnataka, 580020','15.36146954','75.12288580','Sirur Park','2026-03-28T17:24:48.859Z'),
('9bde55e3-cd23-49cb-94f2-3e4abd158015','CMP-2026-00015','Water issue near home','Shortage of water since 5 days','water','Low Pressure','high','submitted','vivekanda','9841385671','Eden Park, Vittal Mallya Road, Karnataka','12.97038915','77.59730432','Ashokanagar','2026-03-28T17:43:06.481Z')
ON CONFLICT (id) DO NOTHING;
