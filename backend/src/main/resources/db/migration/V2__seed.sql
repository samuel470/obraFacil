insert into usuarios (id,nome,email,senha_hash,role,plan,created_at) values
('11111111-1111-1111-1111-111111111111','Eng. Marina','responsavel@obrafacil.app','$2a$10$k4gQb1Uq0kx.jiAeeLyc5ORvVzQ2Byx6aSxUuuz9XhFkpUt74QmT.','RESPONSAVEL','MASTER',now()),
('22222222-2222-2222-2222-222222222222','Cliente João','cliente@obrafacil.app','$2a$10$k4gQb1Uq0kx.jiAeeLyc5ORvVzQ2Byx6aSxUuuz9XhFkpUt74QmT.','CLIENTE','PROFISSIONAL',now());
insert into projects (id,nome,endereco,status,client_id,responsible_id,progresso,orcamento_total,criado_em) values
('33333333-3333-3333-3333-333333333333','Residencial Aurora','Rua das Palmeiras, 120','EM_ANDAMENTO','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',45,450000,now()),
('44444444-4444-4444-4444-444444444444','Comercial Centro Sul','Av. Central, 800','PLANEJAMENTO','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',10,980000,now());
